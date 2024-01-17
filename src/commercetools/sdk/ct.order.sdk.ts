import { Cart } from "@commercetools/platform-sdk";
import { CTApiRoot } from "../CTApiRoot";
import { ICTOrderSDK } from "./ct.order.sdk.interface";

export class CTOrderSDK implements ICTOrderSDK {
  async findOrders({ where, limit, offset }) {
    return await CTApiRoot.orders()
      .get({
        queryArgs: {
          limit: limit,
          offset: offset,
          where: where,
        },
      })
      .execute();
  }

  async findMyOrders({ where, limit, offset }) {
    return await this.findOrders({ where, limit, offset });
  }

  async findOrderById(orderId: string) {
    return await CTApiRoot.orders().withId({ ID: orderId }).get().execute();
  }

  async createOrder(cart: Cart) {
    return await CTApiRoot.orders().post({ body: cart }).execute();
  }

  async findCartById(cartId: string, customerId: string) {
    const where = `id="${cartId}" and customerId="${customerId}"`;
    const cartResponse = await CTApiRoot.carts()
      .get({
        queryArgs: {
          where,
        },
      })
      .execute();
    return cartResponse.body.results?.[0] ?? undefined;
  }
}
