import { CTApiRoot } from "../CTApiRoot";
import {
  ClientResponse,
  Product,
  ProductPagedQueryResponse,
} from "@commercetools/platform-sdk";
import { ICTProductSDK } from "./ct.product.sdk.interface";

export class CTProductSDK implements ICTProductSDK {
  async findProducts({
    where,
    limit,
    offset,
  }): Promise<ClientResponse<ProductPagedQueryResponse>> {
    return await CTApiRoot.products()
      .get({
        queryArgs: {
          limit: limit,
          offset: offset,
          where: where,
        },
      })
      .execute();
  }

  async findProductById(productId: string): Promise<ClientResponse<Product>> {
    return await CTApiRoot.products().withId({ ID: productId }).get().execute();
  }
}
