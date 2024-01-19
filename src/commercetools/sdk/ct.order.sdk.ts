import {
  Cart,
  CartPagedQueryResponse,
  ClientResponse,
  Order,
  OrderPagedQueryResponse,
} from "@commercetools/platform-sdk";
import { CTApiRoot } from "../CTApiRoot";
import { ICTOrderSDK } from "./ct.order.sdk.interface";

export class CTOrderSDK implements ICTOrderSDK {
  async findOrders({
    where,
    limit,
    offset,
  }): Promise<ClientResponse<OrderPagedQueryResponse>> {
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

  async findMyOrders({
    where,
    limit,
    offset,
  }): Promise<ClientResponse<OrderPagedQueryResponse>> {
    return await this.findOrders({ where, limit, offset });
  }

  async findOrderById(orderId: string): Promise<ClientResponse<Order>> {
    return await CTApiRoot.orders().withId({ ID: orderId }).get().execute();
  }

  async createOrder(cart: Cart): Promise<ClientResponse<Order>> {
    return await CTApiRoot.orders().post({ body: cart }).execute();
  }

  async findCartById(cartId: string, customerId: string): Promise<Cart> {
    const where = `id="${cartId}" and customerId="${customerId}"`;
    const cartResponse: ClientResponse<CartPagedQueryResponse> =
      await CTApiRoot.carts()
        .get({
          queryArgs: {
            where,
          },
        })
        .execute();
    return cartResponse.body.results?.[0] ?? undefined;
  }
}
