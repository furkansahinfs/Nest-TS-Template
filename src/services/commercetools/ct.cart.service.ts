import { HttpStatus, Inject, Injectable, Scope } from "@nestjs/common";
import { CreateCartDTO, UpdateCartDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody, ResponseBodyProps } from "src/util";
import {
  AddressDraft,
  Cart,
  CartAddLineItemAction,
  CartChangeLineItemQuantityAction,
  CartDraft,
  CartRemoveLineItemAction,
  CartSetBillingAddressAction,
  CartSetShippingAddressAction,
  CartUpdate,
  CartUpdateAction,
} from "@commercetools/platform-sdk";
import { CartActions } from "src/enums";
import { CTService } from "./ct.service";
import { CTApiRoot } from "src/commercetools";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class CTCartService extends CTService {
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly i18n: I18nService,
  ) {
    super(request);
  }

  async getCarts(params: { cartId?: string }): Promise<ResponseBodyProps> {
    const { cartId } = params;
    const whereString = cartId
      ? `id="${cartId}"`
      : `customerId="${this.customerId}"`;

    return await CTApiRoot.carts()
      .get({
        queryArgs: {
          where: whereString,
        },
      })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  async createCart(dto: CreateCartDTO): Promise<ResponseBodyProps> {
    if (this.customerId) {
      const cartDraft: CartDraft = {
        currency: "USD",
        customerId: this.customerId,
        lineItems: dto.products,
      };
      return await CTApiRoot.carts()
        .post({ body: cartDraft })
        .execute()
        .then(({ body }) =>
          ResponseBody().status(HttpStatus.OK).data(body).build(),
        )
        .catch((error) =>
          ResponseBody().status(error?.statusCode).message({ error }).build(),
        );
    }
  }

  async updateCart(dto: UpdateCartDTO): Promise<ResponseBodyProps> {
    const { actionType, lineItemId, lineItemSKU, quantity, address } = dto;
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
      case CartActions.ADD:
        action = this.generateAddLineItemAction(lineItemSKU);
        break;
      case CartActions.REMOVE:
        action = this.generateRemoveLineItemAction(lineItemId);
        break;
      case CartActions.CHANGEQUANTITY:
        action = this.generateChangeineItemQuantityAction(lineItemId, quantity);
        break;
      case CartActions.SET_SHIPPING_ADDRESS:
        action = this.generateAddressAction(address, "SHIPPING");
        break;
      case CartActions.SET_BILLING_ADDRESS:
        action = this.generateAddressAction(address, "BILLING");
        break;
      default:
        break;
    }

    actions.push(action);
    return await this.updateCartWithActions(actions, cartId);
  }

  private async getCustomerActiveCart(customerId: string) {
    const whereString = `customerId="${customerId}"`;

    const result = await CTApiRoot.carts()
      .get({
        queryArgs: {
          where: whereString,
        },
      })
      .execute();

    if (!result?.body?.results?.[0]) {
      const createdCart = await this.createCart({});
      return createdCart?.data;
    }

    return result?.body?.results?.[0];
  }

  private async updateCartWithActions(
    lineItemsAction: CartUpdateAction[],
    cartId: string,
  ) {
    const cartVersion = await this.getCartVersion(cartId);
    const actionBody: CartUpdate = {
      version: cartVersion,
      actions: lineItemsAction,
    };

    return await CTApiRoot.carts()
      .withId({ ID: cartId })
      .post({ body: actionBody })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  private generateAddressAction(
    address: AddressDraft,
    type: "SHIPPING" | "BILLING",
  ) {
    const setAdressAction:
      | CartSetShippingAddressAction
      | CartSetBillingAddressAction = {
      address: address,
      action: type === "SHIPPING" ? "setShippingAddress" : "setBillingAddress",
    };

    return setAdressAction;
  }

  private generateAddLineItemAction(lineItemSKU: string): CartUpdateAction {
    const addLineItemAction: CartAddLineItemAction = {
      action: "addLineItem",
      sku: lineItemSKU,
      quantity: 1,
    };

    return addLineItemAction;
  }

  private generateRemoveLineItemAction(lineItemId: string): CartUpdateAction {
    const removeLineItemAction: CartRemoveLineItemAction = {
      action: "removeLineItem",
      lineItemId,
    };

    return removeLineItemAction;
  }

  private generateChangeineItemQuantityAction(
    lineItemId: string,
    quantity: number,
  ): CartUpdateAction {
    const changeLineItemQuantityAction: CartChangeLineItemQuantityAction = {
      action: "changeLineItemQuantity",
      lineItemId,
      quantity,
    };

    return changeLineItemQuantityAction;
  }

  private async getCartVersion(cartId: string) {
    const cartResponse: ResponseBodyProps = await this.getCarts({ cartId });
    return cartResponse?.data?.results[0]?.version;
  }

  private async setCartDefaults(cart: Cart) {
    return await CTApiRoot.carts()
      .withId({ ID: cart.id })
      .post({
        body: {
          version: cart.version,
          actions: [
            { action: "setShippingAddress", address: { country: "US" } },
          ],
        },
      })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }
}
