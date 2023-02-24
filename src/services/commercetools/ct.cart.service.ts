import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateCartDTO, GetCartsFilterDTO, UpdateCartDTO } from "src/dto";
import { I18nService } from "nestjs-i18n";
import { ResponseBody, ResponseBodyProps } from "src/util";
import { CTApiRoot } from "../../commercetools/";
import {
  CartDraft,
  CartUpdate,
  CartUpdateAction,
  Customer,
  LineItemDraft,
} from "@commercetools/platform-sdk";
import { CTCustomerService } from "./ct.customer.service";

@Injectable()
export class CTCartService {
  constructor(
    private prisma: PrismaService,
    private ctCustomerSerive: CTCustomerService,
    private readonly i18n: I18nService,
  ) {}

  async getCarts(dto: GetCartsFilterDTO): Promise<ResponseBodyProps> {
    const whereString = dto?.cartId ? `id="${dto.cartId}"` : undefined;

    return await CTApiRoot.carts()
      .get({
        queryArgs: {
          where: whereString,
          limit: dto?.limit ? parseInt(dto.limit) : undefined,
          offset: dto?.offset ? parseInt(dto.offset) : undefined,
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

  async createCart(dto: CreateCartDTO): Promise<ResponseBodyProps> {
    const customerResponse = await this.ctCustomerSerive.getCustomers({
      customerNumber: dto.userId,
    });

    if (customerResponse?.data?.results[0]) {
      const customer: Customer = customerResponse.data.results[0];

      const cartDraft: CartDraft = {
        currency: "USD",
        customerId: customer.id,
        lineItems: dto.products,
      };
      return await CTApiRoot.carts()
        .post({ body: cartDraft })
        .execute()
        .then(({ body }) =>
          ResponseBody().status(HttpStatus.OK).data(body).build(),
        )
        .catch((error) =>
          ResponseBody()
            .status(HttpStatus.NOT_FOUND)
            .message({ error })
            .build(),
        );
    }
  }

  async updateCartLineItems(dto: UpdateCartDTO) {
    const result = await this.addLineItemsToCart(dto.products, dto.cartId);
    return result;
  }

  private async addLineItemsToCart(lineItems: LineItemDraft[], cartId: string) {
    const cartVersion = await this.getCartVersion(cartId);
    const actionBody: CartUpdate = {
      version: cartVersion,
      actions: this.generateAddLineItemBodyForLineItems(lineItems),
    };

    return await CTApiRoot.carts()
      .withId({ ID: cartId })
      .post({ body: actionBody })
      .execute()
      .then(({ body }) =>
        ResponseBody().status(HttpStatus.OK).data(body).build(),
      )
      .catch((error) =>
        ResponseBody().status(HttpStatus.NOT_FOUND).message({ error }).build(),
      );
  }

  private async getCartVersion(cartId: string) {
    const cartResponse: ResponseBodyProps = await this.getCarts({
      cartId: cartId,
    });
    return cartResponse?.data?.results[0]?.version;
  }

  private generateAddLineItemBodyForLineItems(
    lineItems: LineItemDraft[],
  ): CartUpdateAction[] {
    const actions: CartUpdateAction[] = [];
    lineItems.forEach((lineItem: LineItemDraft) => {
      actions.push({
        action: "addLineItem",
        productId: lineItem.productId,
        variantId: lineItem.variantId,
        quantity: 1,
        supplyChannel: {
          typeId: lineItem.supplyChannel?.typeId,
          id: lineItem.supplyChannel?.id,
        },
        distributionChannel: {
          typeId: lineItem.distributionChannel?.typeId,
          id: lineItem.distributionChannel?.id,
        },
        externalTaxRate: {
          name: lineItem.externalTaxRate?.name,
          amount: lineItem.externalTaxRate?.amount,
          country: lineItem.externalTaxRate?.country,
          state: lineItem.externalTaxRate?.state,
        },
      });
    });

    return actions;
  }
}
