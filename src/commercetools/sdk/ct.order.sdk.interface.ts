import {
  Cart,
  ClientResponse,
  Order,
  OrderPagedQueryResponse,
} from "@commercetools/platform-sdk";

interface FindOrdersParam {
  where?: string;
  limit?: number;
  offset?: number;
}

export interface ICTOrderSDK {
  findOrders({
    where,
    limit,
    offset,
  }: FindOrdersParam): Promise<ClientResponse<OrderPagedQueryResponse>>;
  findMyOrders({
    where,
    limit,
    offset,
  }: FindOrdersParam): Promise<ClientResponse<OrderPagedQueryResponse>>;
  findOrderById(orderId: string): Promise<ClientResponse<Order>>;
  findCartById(cartId: string, customerId): Promise<Cart>;
}
