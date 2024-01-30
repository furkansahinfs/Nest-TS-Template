import {
  ClientResponse,
  ProductProjection,
  ProductProjectionPagedQueryResponse,
} from "@commercetools/platform-sdk";

type FindProductsParam = {
  where?: string;
  limit?: number;
  offset?: number;
};

export interface CTProductSDK {
  findProducts({
    where,
    limit,
    offset,
  }: FindProductsParam): Promise<
    ClientResponse<ProductProjectionPagedQueryResponse>
  >;
  findProductById(orderId: string): Promise<ClientResponse<ProductProjection>>;
}
