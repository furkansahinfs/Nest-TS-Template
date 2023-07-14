import { HttpStatus, Inject, Injectable, Scope } from "@nestjs/common";
import { GetProductsFilterDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTService } from "./ct.service";
import { CTApiRoot } from "src/commercetools";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class CTProductService extends CTService {
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly i18n: I18nService,
  ) {
    super(request);
  }

  async getProducts(dto: GetProductsFilterDTO) {
    const whereString = dto?.productId
      ? this.getWhereIdString(dto.productId)
      : undefined;

    return await CTApiRoot.products()
      .get({
        queryArgs: {
          limit: dto?.limit ? parseInt(dto.limit) : undefined,
          offset: dto?.offset ? parseInt(dto.offset) : undefined,
          where: whereString,
        },
      })
      .execute()
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
            id: dto?.productId,
          })
          .build();
      });
  }

  async getProductWithId(productId: string) {
    return await CTApiRoot.products()
      .withId({ ID: productId })
      .get()
      .execute()
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

  private getWhereIdString(productIdParam: string) {
    const ids = productIdParam.split(",");

    return ids?.length > 1
      ? `id in (${this.createWhereStringForInPredicate(ids)})`
      : `id="${productIdParam}"`;
  }
}
