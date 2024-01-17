import { HttpStatus, Injectable } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTProductSDK } from "src/commercetools";
import { IResponse } from "src/types";
import { generateProductWhereIdString } from "./utils";

@Injectable()
export class CTProductService {
  CTProductSDK: CTProductSDK;
  constructor(private readonly i18n: I18nService) {
    this.CTProductSDK = new CTProductSDK();
  }

  async getProducts(dto: GetProductsFilterDTO): Promise<IResponse> {
    const where = dto?.productIds
      ? generateProductWhereIdString(dto.productIds)
      : undefined;

    const limit: number | undefined = dto?.limit
      ? parseInt(dto.limit)
      : undefined;

    const offset: number | undefined = dto?.offset && parseInt(dto.offset);

    return await this.CTProductSDK.findProducts({ where, limit, offset })
      .then(({ body }) =>
        ResponseBody()
          .status(HttpStatus.OK)
          .data({ total: body.total, results: body.results })
          .build(),
      )
      .catch((error) => {
        return ResponseBody()
          .status(error?.statusCode)
          .message({
            error: error,
            where,
          })
          .build();
      });
  }

  async getProductWithId(productId: string): Promise<IResponse> {
    return await this.CTProductSDK.findProductById(productId)
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody()
          .status(error?.statusCode)
          .message({ error, id: productId })
          .build(),
      );
  }
}
