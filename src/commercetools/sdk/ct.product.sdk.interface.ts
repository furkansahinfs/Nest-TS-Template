import {
  ClientResponse,
  ProductProjection,
  ProductProjectionPagedQueryResponse,
} from "@commercetools/platform-sdk";

interface FindProductsParam {
  where?: string;
  limit?: number;
  offset?: number;
}

export interface ICTProductSDK {
  findProducts({
    where,
    limit,
    offset,
  }: FindProductsParam): Promise<
    ClientResponse<ProductProjectionPagedQueryResponse>
  >;
  findProductById(orderId: string): Promise<ClientResponse<ProductProjection>>;
}
