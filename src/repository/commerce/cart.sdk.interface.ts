import {
  Cart,
  CartDraft,
  CartPagedQueryResponse,
  CartUpdateAction,
  ClientResponse,
} from "@commercetools/platform-sdk";

type FindCartsParam = {
  where?: string;
  limit?: number;
  offset?: number;
};

export interface CTCartSDK {
  findCarts({
    where,
    limit,
    offset,
  }: FindCartsParam): Promise<ClientResponse<CartPagedQueryResponse>>;
  findCartById(cartId: string): Promise<Cart>;
  findCartByCustomerId(customerId: string): Promise<Cart>;
  createCart(cartDraft: CartDraft): Promise<ClientResponse<Cart>>;
  updateCart(
    cartId: string,
    lineItemsAction: CartUpdateAction[],
  ): Promise<ClientResponse<Cart>>;
}
