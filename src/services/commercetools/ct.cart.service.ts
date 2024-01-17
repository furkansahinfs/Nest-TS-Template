import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { CreateCartDTO, UpdateCartDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import {
  Cart,
  CartDraft,
  CartUpdateAction,
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
import { CTCartSDK } from "src/commercetools";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable()
export class CTCartService extends CTService {
  CTCartSDK: CTCartSDK;
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly i18n: I18nService,
  ) {
    super(request);
    this.CTCartSDK = new CTCartSDK();
  }

  async getCarts(params: { cartId?: string }): Promise<IResponse> {
    const { cartId } = params;
    const whereString = cartId
      ? `id="${cartId}"`
      : `customerId="${this.customerId}"`;

    return await this.CTCartSDK.findCarts({
      where: whereString,
      limit: undefined,
      offset: undefined,
    })
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  async createCart(dto: CreateCartDTO): Promise<IResponse> {
    if (this.customerId) {
      const cartDraft: CartDraft = {
        currency: "USD",
        customerId: this.customerId,
        lineItems: dto.products,
      };
      return await this.CTCartSDK.createCart(cartDraft)
        .then(({ body }) =>
          ResponseBody().status(HttpStatus.OK).data(body).build(),
        )
        .catch((error) =>
          ResponseBody().status(error?.statusCode).message({ error }).build(),
        );
    }
  }

  async updateCart(dto: UpdateCartDTO): Promise<IResponse> {
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
      const cart: Cart | undefined = await this.getCustomerActiveCart(
        this.customerId,
      );
      cartId = cart?.id;
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

  async getCustomerActiveCart(customerId?: string) {
    const where = `customerId="${this.customerId}" and cartState = "Active"`;
    const cartQueryResponse = await this.CTCartSDK.findCarts({
      where,
      limit: undefined,
      offset: undefined,
    });

    const cart: Cart | undefined = cartQueryResponse.body?.results?.[0];

    if (cart) {
      return cart;
    }

    const cartDraft: CartDraft = {
      currency: "USD",
      customerId: customerId,
      lineItems: [],
    };
    const createdCart = await this.CTCartSDK.createCart(cartDraft);
    return createdCart.body;
  }

  private async updateCartWithActions(
    lineItemsAction: CartUpdateAction[],
    cartId: string,
  ) {
    return await this.CTCartSDK.updateCart(cartId, lineItemsAction)
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  private async checkDiscountCode(discountCode: string): Promise<DiscountCode> {
    return await this.CTCartSDK.getDiscount(discountCode);
  }
}
