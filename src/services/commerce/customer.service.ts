import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import {
  CreateCustomerDTO,
  GetCustomersFilterDTO,
  UpdateCustomerDTO,
} from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import {
  AddressDraft,
  Customer,
  CustomerAddAddressAction,
  CustomerDraft,
  CustomerSetDefaultBillingAddressAction,
  CustomerSetDefaultShippingAddressAction,
  CustomerSignInResult,
} from "@commercetools/platform-sdk";
import { CommerceService } from "./commerce.service";
import { CustomerActions } from "src/enums/customerAction.enum";
import { IResponse, QueryData } from "src/types";
import { generateCustomerWhereString } from "./utils";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { CTCustomerSDKImpl } from "src/repository";

@Injectable()
export class CustomerService extends CommerceService {
  ctCustomerSDKImpl: CTCustomerSDKImpl;
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly i18n: I18nService,
  ) {
    super(request);
    this.ctCustomerSDKImpl = new CTCustomerSDKImpl();
  }

  async getCustomers(
    dto: GetCustomersFilterDTO,
  ): Promise<IResponse<QueryData<Customer>>> {
    const where = dto?.customerId
      ? generateCustomerWhereString({ customerIdParam: dto.customerId })
      : dto?.customerNumber
      ? generateCustomerWhereString({ customerNumberParam: dto.customerNumber })
      : undefined;

    return this.ctCustomerSDKImpl
      .findCustomers({
        where,
        limit: this.getLimit(dto?.limit),
        offset: this.getOffset(dto?.offset),
      })
      .then(({ body }) =>
        ResponseBody()
          .status(HttpStatus.OK)
          .data({ total: body.total, results: body.results })
          .build(),
      )
      .catch((error) =>
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  async getMe(): Promise<IResponse<Customer>> {
    const customer = await this.ctCustomerSDKImpl.findCustomerById(
      this.customerId,
    );
    if (customer) {
      return ResponseBody().status(HttpStatus.OK).data(customer).build();
    }
    return ResponseBody()
      .status(HttpStatus.NOT_FOUND)
      .message({ error: this.i18n.t("customer.customer_not_found") })
      .build();
  }

  async createCustomer(
    dto: CreateCustomerDTO,
  ): Promise<IResponse<CustomerSignInResult>> {
    const customerDraft: CustomerDraft = {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      customerNumber: dto.customerNumber,
      password: dto.password,
    };

    return this.ctCustomerSDKImpl
      .createCustomer(customerDraft)
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.CREATED).data(body).build(),
      )
      .catch((error) =>
        ResponseBody()
          .status(HttpStatus.BAD_REQUEST)
          .message({ error: error?.body?.message })
          .build(),
      );
  }

  async updateCustomer(dto: UpdateCustomerDTO): Promise<IResponse<Customer>> {
    switch (dto.actionType) {
      case CustomerActions.SET_SHIPPING_ADDRESS:
        return this.setAddress(dto.address, "SHIPPING", true);
      case CustomerActions.SET_BILLING_ADDRESS:
        return this.setAddress(dto.address, "BILLING", true);
      default:
        break;
    }
  }

  private async setAddress(
    address: AddressDraft,
    type: "SHIPPING" | "BILLING",
    overrideDefault?: boolean,
  ): Promise<IResponse<Customer>> {
    const addAdressAction: CustomerAddAddressAction = {
      address: address,
      action: "addAddress",
    };

    const updatedCustomerResponse: Customer = await this.ctCustomerSDKImpl
      .updateCustomer(this.customerId, [addAdressAction])
      .then(({ body }) => body)
      .catch((error) =>
        ResponseBody()
          .status(HttpStatus.BAD_REQUEST)
          .message({ error: error?.body?.message })
          .build(),
      );

    if (!updatedCustomerResponse?.id) {
      return ResponseBody()
        .status(HttpStatus.OK)
        .data(updatedCustomerResponse)
        .build();
    }

    const updatedCustomer = updatedCustomerResponse;

    if (!overrideDefault) {
      return ResponseBody().status(HttpStatus.OK).data(updatedCustomer).build();
    }

    return this.overrideDefaultAddress(
      updatedCustomer.addresses?.[0]?.id,
      type,
    );
  }

  private async overrideDefaultAddress(
    addressId: string,
    type: "SHIPPING" | "BILLING",
  ): Promise<IResponse<Customer>> {
    const setDefaultAddressAction:
      | CustomerSetDefaultShippingAddressAction
      | CustomerSetDefaultBillingAddressAction = {
      addressId,
      action:
        type === "SHIPPING"
          ? "setDefaultShippingAddress"
          : "setDefaultBillingAddress",
    };

    return this.ctCustomerSDKImpl
      .updateCustomer(this.customerId, [setDefaultAddressAction])
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody()
          .status(HttpStatus.BAD_REQUEST)
          .message({ error: error?.body?.message })
          .build(),
      );
  }
}
