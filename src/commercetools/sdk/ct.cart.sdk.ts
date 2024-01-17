import {
  Cart,
  CartDraft,
  CartUpdate,
  CartUpdateAction,
  DiscountCode,
} from "@commercetools/platform-sdk";
import { ICTCartSDK } from "./ct.cart.sdk.interface";
import { CTApiRoot } from "../CTApiRoot";

export class CTCartSDK implements ICTCartSDK {
  async findCarts({ where, limit, offset }) {
    return await CTApiRoot.carts()
      .get({
        queryArgs: {
          where,
          limit,
          offset,
        },
      })
      .execute();
  }

  async findCartById(cartId: string): Promise<Cart> {
    const where = `id="${cartId}"`;
    const cartByIdResponse = await this.findCarts({
      where,
      limit: 1,
      offset: 0,
    });
    return cartByIdResponse.body.results[0] ?? undefined;
  }

  async findCartByCustomerId(customerId: string): Promise<Cart> {
    const where = `customerId="${customerId}"`;
    const cartByCustomerIdResponse = await this.findCarts({
      where,
      limit: 1,
      offset: 0,
    });

    return cartByCustomerIdResponse.body.results[0] ?? undefined;
  }

  async createCart(cartDraft: CartDraft) {
    return await CTApiRoot.carts().post({ body: cartDraft }).execute();
  }

  async updateCart(cartId: string, lineItemsAction: CartUpdateAction[]) {
    const cartVersion = await this.getCartVersion(cartId);
    const actionBody: CartUpdate = {
      version: cartVersion,
      actions: lineItemsAction,
    };

    return await CTApiRoot.carts()
      .withId({ ID: cartId })
      .post({ body: actionBody })
      .execute();
  }

  async getDiscount(discountCode: string): Promise<DiscountCode> {
    const discountResponse = await CTApiRoot.discountCodes()
      .get({
        queryArgs: { where: `code="${discountCode}"` },
      })
      .execute();

    return discountResponse.body?.results?.[0];
  }

  private async getCartVersion(cartId: string): Promise<number> {
    const cartResponse = await this.findCartById(cartId);
    return cartResponse?.version;
  }
}
