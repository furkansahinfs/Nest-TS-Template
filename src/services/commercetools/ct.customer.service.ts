import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateCustomerDTO, GetCustomersFilterDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTApiRoot } from "../../commercetools/";
import { CustomerDraft } from "@commercetools/platform-sdk";

@Injectable()
export class CTCustomerService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getCustomers(dto: GetCustomersFilterDTO) {
    if (dto?.customerId) {
      return await this.getCustomerWithId(dto.customerId);
    }

    if (dto?.customerNumber) {
      return await this.getCustomerWithNumber(dto.customerNumber);
    }

    return await CTApiRoot.customers()
      .get({
        queryArgs: { limit: parseInt(dto.limit), offset: parseInt(dto.offset) },
      })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(HttpStatus.NOT_FOUND).message({ error }).build(),
      );
  }

  async getCustomerWithId(customerId: string) {
    return await CTApiRoot.customers()
      .withId({ ID: customerId })
      .get()
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody()
          .status(HttpStatus.NOT_FOUND)
          .message({ error, id: customerId })
          .build(),
      );
  }

  async getCustomerWithNumber(customerNumber: string) {
    return await CTApiRoot.customers()
      .get({
        queryArgs: {
          where: `customerNumber="${customerNumber}"`,
        },
      })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody()
          .status(HttpStatus.NOT_FOUND)
          .message({ error, number: customerNumber })
          .build(),
      );
  }

  async createCustomer(dto: CreateCustomerDTO) {
    const customerDraft: CustomerDraft = {
      email: dto.username,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      customerNumber: dto?.customerNumber,
    };
    return await CTApiRoot.customers()
      .post({ body: customerDraft })
      .execute()
      .then(({ body }) => console.log(body))
      .catch((error) => console.log(error));
  }
}
