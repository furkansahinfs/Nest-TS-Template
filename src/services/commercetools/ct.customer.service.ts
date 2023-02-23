import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { GetCustomerDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTApiRoot } from "../../commercetools/";

@Injectable()
export class CTCustomerService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getCustomer(dto: GetCustomerDTO) {
    const customer = await CTApiRoot.customers()
      .withId({ ID: dto.customerId })
      .get()
      .execute();

    if (customer) {
      return ResponseBody().status(HttpStatus.OK).data(customer).build();
    }

    return ResponseBody()
      .status(HttpStatus.NOT_FOUND)
      .message({
        error: this.i18n.translate("commercetools.customer.customer_not_found"),
        id: dto.customerId,
      })
      .build();
  }
}
