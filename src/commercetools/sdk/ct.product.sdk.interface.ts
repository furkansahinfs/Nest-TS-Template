import {
  ClientResponse,
  Product,
  ProductPagedQueryResponse,
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
  }: FindProductsParam): Promise<ClientResponse<ProductPagedQueryResponse>>;
  findProductById(orderId: string): Promise<ClientResponse<Product>>;
}
