import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CreateCartDTO, UpdateCartDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import {
  Cart,
  CartDraft,
  CartPagedQueryResponse,
  CartUpdateAction,
  ClientResponse,
  Customer,
  DiscountCode,
} from "@commercetools/platform-sdk";
import { CartActions } from "src/enums";
import { CTService } from "./ct.service";
import { IResponse } from "src/types";
import {
  generateAddDiscountCodeAction,
  generateAddLineItemAction,
  generateAddressAction,
  generateChangeineItemQuantityAction,
  generateRemoveDiscountCodeAction,
  generateRemoveLineItemAction,
} from "./utils";
import { CTCartSDK, CTCustomerSDK } from "src/commercetools";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class CTCartService extends CTService {
  CTCartSDK: CTCartSDK;
  CTCustomerSDK: CTCustomerSDK;
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly i18n: I18nService,
  ) {
    super(request);
    this.CTCartSDK = new CTCartSDK();
    this.CTCustomerSDK = new CTCustomerSDK();
  }

  async getCarts(params: {
    cartId?: string;
  }): Promise<IResponse<CartPagedQueryResponse>> {
    const { cartId } = params;
    const whereString = cartId
      ? `id="${cartId}"`
      : `customerId="${this.customerId}"`;

    return await this.CTCartSDK.findCarts({
      where: whereString,
      limit: this.getLimit(),
      offset: this.getOffset(),
    })
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  async createCart(dto: CreateCartDTO): Promise<IResponse<Cart>> {
    if (this.customerId) {
      const cartDraft: CartDraft = {
        currency: "USD",
        customerId: this.customerId,
        lineItems: dto.products,
      };
      return await this.CTCartSDK.createCart(cartDraft)
        .then(async ({ body }) => {
          const updatedCart: Cart = await this.setCartDefaults(body.id);
          return ResponseBody().status(HttpStatus.OK).data(updatedCart).build();
        })
        .catch((error) =>
          ResponseBody().status(error?.statusCode).message({ error }).build(),
        );
    }
  }

  async updateCart(dto: UpdateCartDTO): Promise<IResponse<Cart>> {
    const {
      actionType,
      lineItemId,
      lineItemSKU,
      quantity,
      address,
      discountCode,
    } = dto;
    let cartId = dto.cartId;
    if (!cartId) {
      const cart: IResponse<Cart> = await this.getCustomerActiveCart();
      cartId = cart?.data?.id;
    }
    const actions: CartUpdateAction[] = [];
    let action: CartUpdateAction = null;

    switch (actionType) {
      case CartActions.ADD_LINE_ITEM:
        action = generateAddLineItemAction(lineItemSKU);
        break;
      case CartActions.REMOVE_LINE_ITEM:
        action = generateRemoveLineItemAction(lineItemId);
        break;
      case CartActions.CHANGE_LINE_ITEM_QUANTITY:
        action = generateChangeineItemQuantityAction(lineItemId, quantity);
        break;
      case CartActions.SET_SHIPPING_ADDRESS:
        action = generateAddressAction(address, "SHIPPING");
        break;
      case CartActions.SET_BILLING_ADDRESS:
        action = generateAddressAction(address, "BILLING");
        break;
      case CartActions.ADD_DISCOUNT_CODE:
        action = generateAddDiscountCodeAction(discountCode);
        break;
      case CartActions.REMOVE_DISCOUNT_CODE:
        const discountCodeObj = await this.checkDiscountCode(discountCode);
        action = generateRemoveDiscountCodeAction(discountCodeObj?.id);
        break;
      default:
        break;
    }

    actions.push(action);
    return await this.updateCartWithActions(actions, cartId);
  }

  async getCustomerActiveCart(): Promise<IResponse<Cart>> {
    const where = `customerId="${this.customerId}" and cartState = "Active"`;
    const cartQueryResponse: ClientResponse<CartPagedQueryResponse> =
      await this.CTCartSDK.findCarts({
        where,
        limit: this.getLimit(),
        offset: this.getOffset(),
      });

    const cart: Cart | undefined = cartQueryResponse.body?.results?.[0];

    if (cart) {
      const updatedCart: Cart = await this.setCartDefaults(cart.id);
      return ResponseBody().status(HttpStatus.OK).data(updatedCart).build();
    }

    const cartDraft: CartDraft = {
      currency: "USD",
      customerId: this.customerId,
      lineItems: [],
    };
    return await this.CTCartSDK.createCart(cartDraft)
      .then(async (createdCart) => {
        const updatedCart: Cart = await this.setCartDefaults(
          createdCart.body.id,
        );
        return ResponseBody().status(HttpStatus.OK).data(updatedCart).build();
      })
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  private async updateCartWithActions(
    lineItemsAction: CartUpdateAction[],
    cartId: string,
  ): Promise<IResponse<Cart>> {
    return await this.CTCartSDK.updateCart(cartId, lineItemsAction)
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  private async setCartDefaults(cartId: string): Promise<Cart> {
    const customer: Customer = await this.CTCustomerSDK.findCustomerById(
      this.customerId,
    );

    const where = cartId ? `id="${cartId}"` : `customerId="${this.customerId}"`;
    const cartQueryResponse: ClientResponse<CartPagedQueryResponse> =
      await this.CTCartSDK.findCarts({
        where,
        limit: 1,
        offset: 0,
      });

    const cart = cartQueryResponse?.body?.results?.[0];

    if (customer && cart) {
      const updateCartActions: Array<UpdateCartDTO> = [
        {
          cartId,
          actionType: "setShippingAddress",
          address: customer.addresses.find(
            (item) => item.id === customer.defaultShippingAddressId,
          ),
        },
        {
          cartId,
          actionType: "setBillingAddress",
          address: customer.addresses.find(
            (item) => item.id === customer.defaultBillingAddressId,
          ),
        },
      ];
      return await this.updateCartDefaulsInOrder(updateCartActions);
    }
  }

  private async updateCartDefaulsInOrder(actions: Array<UpdateCartDTO>) {
    const res = await actions.reduce(
      (p, v) => p.then((a) => this.updateCart(v).then((r) => a.concat([r]))),
      Promise.resolve([]),
    );

    return Promise.all(res).then((values) => {
      const successResponses = values.filter(
        (promise: IResponse<Cart>) => promise.success && promise.data,
      );
      return successResponses[successResponses.length - 1].data;
    });
  }

  private async checkDiscountCode(discountCode: string): Promise<DiscountCode> {
    return await this.CTCartSDK.getDiscount(discountCode);
  }
}
