import {
  Cart,
  CartPagedQueryResponse,
  ClientResponse,
  Order,
  OrderPagedQueryResponse,
} from "@commercetools/platform-sdk";
import { CTOrderSDK } from "./order.sdk.interface";
import { CTApiRoot } from "src/commercetools";

export class CTOrderSDKImpl implements CTOrderSDK {
  async findOrders({
    where,
    limit,
    offset,
  }): Promise<ClientResponse<OrderPagedQueryResponse>> {
    return CTApiRoot.orders()
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
    return this.findOrders({ where, limit, offset });
  }

  async findOrderById(orderId: string): Promise<ClientResponse<Order>> {
    return CTApiRoot.orders().withId({ ID: orderId }).get().execute();
  }

  async createOrder(cart: Cart): Promise<ClientResponse<Order>> {
    return CTApiRoot.orders().post({ body: cart }).execute();
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
