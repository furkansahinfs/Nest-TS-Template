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
    const whereString = dto?.customerId
      ? `id="${dto.customerId}"`
      : dto?.customerNumber
      ? `customerNumber="${dto.customerNumber}"`
      : undefined;

    return await CTApiRoot.customers()
      .get({
        queryArgs: {
          limit: parseInt(dto.limit),
          offset: parseInt(dto.offset),
          where: whereString,
        },
      })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(HttpStatus.NOT_FOUND).message({ error }).build(),
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
