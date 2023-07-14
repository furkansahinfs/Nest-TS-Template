import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from "@nestjs/common";
import {
  CreateCustomerDTO,
  GetCustomersFilterDTO,
  UpdateCustomerDTO,
} from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody, ResponseBodyProps } from "src/util";
import {
  AddressDraft,
  Customer,
  CustomerAddAddressAction,
  CustomerDraft,
  CustomerSetDefaultBillingAddressAction,
  CustomerSetDefaultShippingAddressAction,
  CustomerUpdateAction,
} from "@commercetools/platform-sdk";
import { CTService } from "./ct.service";
import { CustomerActions } from "src/enums/customerAction.enum";
import { CTApiRoot } from "src/commercetools";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class CTCustomerService extends CTService {
  constructor(
    @Inject(REQUEST) protected readonly request: Request,
    private readonly i18n: I18nService,
  ) {
    super(request);
  }

  async getCustomers(dto: GetCustomersFilterDTO): Promise<ResponseBodyProps> {
    const whereString = dto?.customerId
      ? this.getWhereString({ customerIdParam: dto.customerId })
      : dto?.customerNumber
      ? this.getWhereString({ customerNumberParam: dto.customerNumber })
      : undefined;

    return await CTApiRoot.customers()
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
        ResponseBody().status(error?.statusCode).message({ error }).build(),
      );
  }

  async getMe(): Promise<ResponseBodyProps> {
    return await CTApiRoot.customers()
      .withId({ ID: this.customerId })
      .get()
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody()
          .status(error?.statusCode)
          .message({ error: error?.body?.message })
          .build(),
      );
  }

  async createCustomer(dto: CreateCustomerDTO) {
    const customerDraft: CustomerDraft = dto;

    return await CTApiRoot.customers()
      .post({ body: customerDraft })
      .execute()
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

  async updateCustomer(dto: UpdateCustomerDTO) {
    switch (dto.actionType) {
      case CustomerActions.SET_SHIPPING_ADDRESS:
        return await this.setAddress(dto.actionData, "SHIPPING", true);
      case CustomerActions.SET_BILLING_ADDRESS:
        return await this.setAddress(dto.actionData, "BILLING", true);
      default:
        break;
    }
  }

  async updateCustomerWithAction(action: CustomerUpdateAction) {
    const customerVersion = await this.getCustomerVersion();

    return await CTApiRoot.customers()
      .withId({ ID: this.customerId })
      .post({ body: { actions: [action], version: customerVersion } })
      .execute()
      .then(({ body }) => body)
      .catch((error) => {
        throw new BadRequestException({
          message: { error: error?.body?.message },
        });
      });
  }

  private async setAddress(
    address: AddressDraft,
    type: "SHIPPING" | "BILLING",
    overrideDefault?: boolean,
  ) {
    const addAdressAction: CustomerAddAddressAction = {
      address: address,
      action: "addAddress",
    };

    const updatedCustomer: Customer = await this.updateCustomerWithAction(
      addAdressAction,
    );

    if (!overrideDefault) {
      return updatedCustomer;
    }

    const setDefaultAddressAction:
      | CustomerSetDefaultShippingAddressAction
      | CustomerSetDefaultBillingAddressAction = {
      addressId: updatedCustomer.addresses?.[0]?.id, // TODO filter first shipping/billing
      action:
        type === "SHIPPING"
          ? "setDefaultShippingAddress"
          : "setDefaultBillingAddress",
    };

    return await CTApiRoot.customers()
      .withId({ ID: this.customerId })
      .post({
        body: {
          actions: [setDefaultAddressAction],
          version: updatedCustomer.version,
        },
      })
      .execute()
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

  async findCustomerByCustomerNumber(
    customerNumber: string,
  ): Promise<Customer> {
    const whereString = `customerNumber="${customerNumber}"`;

    const result = await CTApiRoot.customers()
      .get({
        queryArgs: {
          where: whereString,
        },
      })
      .execute();

    return result?.body?.results?.[0];
  }

  async findCustomerByCustomerId(customerId: string): Promise<Customer> {
    const whereString = `id="${customerId}"`;

    const result = await CTApiRoot.customers()
      .get({
        queryArgs: {
          where: whereString,
        },
      })
      .execute();

    return result?.body?.results?.[0];
  }

  private async getCustomerVersion(customerId?: string): Promise<number> {
    const whereString = `id="${customerId ?? this.customerId}"`;

    const result = await CTApiRoot.customers()
      .get({
        queryArgs: {
          where: whereString,
        },
      })
      .execute();

    return result?.body?.results?.[0].version;
  }

  private getWhereString(whereParams: {
    customerIdParam?: string;
    customerNumberParam?: string;
  }) {
    const { customerIdParam, customerNumberParam } = whereParams;

    if (customerIdParam) {
      const predicateIds = customerIdParam.split(",");
      return predicateIds?.length > 1
        ? `id in (${this.createWhereStringForInPredicate(predicateIds)})`
        : `id="${customerIdParam}"`;
    }

    if (customerNumberParam) {
      const predicateCustomerNumbers = customerNumberParam.split(",");
      return predicateCustomerNumbers?.length > 1
        ? `customerNumber in (${this.createWhereStringForInPredicate(
            predicateCustomerNumbers,
          )})`
        : `customerNumber="${customerIdParam}"`;
    }

    return undefined;
  }
}
