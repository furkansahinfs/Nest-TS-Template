import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { GetProductDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody } from "src/util";
import { CTApiRoot } from "../../commercetools/";
@Injectable()
export class CTProductService {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getProduct(dto: GetProductDTO) {
    const product = await CTApiRoot.products()
      .withId({ ID: dto.productId })
      .get()
      .execute();

    if (product) {
      return ResponseBody().status(HttpStatus.OK).data(product).build();
    }

    return ResponseBody()
      .status(HttpStatus.NOT_FOUND)
      .message({
        error: this.i18n.translate("commercetools.product.product_not_found"),
        id: dto.productId,
      })
      .build();
  }
}
