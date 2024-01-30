import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class CommerceService {
  protected customerId: string = this.request["user"]?.["ct_customer_id"];

  constructor(@Inject(REQUEST) protected readonly request: Request) {}

  public setCTCustomer(customerId: string) {
    this.customerId = customerId;
  }

  public getLimit(limit?: string): number | undefined {
    return limit ? parseInt(limit) : undefined;
  }

  public getOffset(offset?: string): number | undefined {
    return offset ? parseInt(offset) : undefined;
  }
}
