import { HttpStatus, Inject, Injectable, Scope } from "@nestjs/common";
import { GetOrdersFilterDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTService } from "./ct.service";
import { CTApiRoot } from "src/commercetools";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class CTOrderService extends CTService {
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly i18n: I18nService,
  ) {
    super(request);
  }

  async getOrders(dto: GetOrdersFilterDTO) {
    const whereString = dto?.orderId
      ? this.getWhereString({ orderIdParam: dto.orderId })
      : dto?.orderNumber
      ? this.getWhereString({ orderNumberParam: dto.orderNumber })
      : undefined;

    return await CTApiRoot.orders()
      .get({
        queryArgs: {
          limit: dto?.limit ? parseInt(dto.limit) : undefined,
          offset: dto?.offset ? parseInt(dto.offset) : undefined,
          where: whereString,
        },
      })
      .execute()
      .then(({ body }) => {
        console.log("1111", body);
        return ResponseBody()
          .status(HttpStatus.OK)
          .data({ total: body.total, results: body.results })
          .build();
      })
      .catch((error) =>
        ResponseBody()
          .status(error?.statusCode)
          .message({
            error,
            id: dto.orderId,
          })
          .build(),
      );
  }

  async getMyOrders(dto: GetOrdersFilterDTO) {
    const whereString = `customerId="${this.customerId}"`;
    return await CTApiRoot.orders()
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
      .catch((error) =>
        ResponseBody()
          .status(error?.statusCode)
          .message({
            error,
            id: dto.orderId,
          })
          .build(),
      );
  }

  async getOrderWithId(orderId: string) {
    return await CTApiRoot.orders()
      .withId({ ID: orderId })
      .get()
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody()
          .status(error?.statusCode)
          .message({ error, id: orderId })
          .build(),
      );
  }

  private getWhereString(whereParams: {
    orderIdParam?: string;
    orderNumberParam?: string;
  }) {
    const { orderIdParam, orderNumberParam } = whereParams;

    if (orderIdParam) {
      const predicateIds = orderIdParam.split(",");
      return predicateIds?.length > 1
        ? `id in (${this.createWhereStringForInPredicate(predicateIds)})`
        : `id="${orderIdParam}"`;
    }

    if (orderNumberParam) {
      const predicateCustomerNumbers = orderNumberParam.split(",");
      return predicateCustomerNumbers?.length > 1
        ? `orderNumber in (${this.createWhereStringForInPredicate(
            predicateCustomerNumbers,
          )})`
        : `orderNumber="${orderNumberParam}"`;
    }

    return undefined;
  }
}
