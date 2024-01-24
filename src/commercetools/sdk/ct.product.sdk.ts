import { CTApiRoot } from "../CTApiRoot";
import {
  ClientResponse,
  ProductProjection,
  ProductProjectionPagedQueryResponse,
} from "@commercetools/platform-sdk";
import { ICTProductSDK } from "./ct.product.sdk.interface";

export class CTProductSDK implements ICTProductSDK {
  async findProducts({
    where,
    limit,
    offset,
  }): Promise<ClientResponse<ProductProjectionPagedQueryResponse>> {
    return CTApiRoot.productProjections()
      .get({
        queryArgs: {
          limit: limit,
          offset: offset,
          where: where,
        },
      })
      .execute();
  }

  async findProductById(
    productId: string,
  ): Promise<ClientResponse<ProductProjection>> {
    return CTApiRoot.productProjections()
      .withId({ ID: productId })
      .get()
      .execute();
  }
}
