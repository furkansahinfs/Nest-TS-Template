import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class CTService {
  protected customerId: string = this.request["user"]?.["ct_customer_id"];

  constructor(@Inject(REQUEST) protected readonly request: Request) {}

  public setCTCustomer(customerId: string) {
    this.customerId = customerId;
  }

  protected createWhereStringForInPredicate(predicateStringArr: string[]) {
    const predicateStringsWithQuote =
      '"' + predicateStringArr.join('", "') + '"';

    return predicateStringsWithQuote;
  }
}
