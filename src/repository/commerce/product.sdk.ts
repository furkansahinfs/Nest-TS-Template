import {
  ClientResponse,
  ProductProjection,
  ProductProjectionPagedQueryResponse,
} from "@commercetools/platform-sdk";
import { CTProductSDK } from "./product.sdk.interface";
import { CTApiRoot } from "src/commercetools";

export class CTProductSDKImpl implements CTProductSDK {
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
