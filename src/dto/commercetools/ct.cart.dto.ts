import { AddressDraft, LineItemDraft } from "@commercetools/platform-sdk";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";
import { CartActions } from "src/enums";

export class GetCartFilterDTO {
  @IsOptional()
  @IsString()
  cartId?: string;
}

export class CreateCartDTO {
  products?: LineItemDraft[];
}

export class UpdateCartDTO {
  @IsNotEmpty()
  @IsEnum(CartActions)
  @IsString()
  actionType: string;

  @ValidateIf(
    (o) =>
      o.actionType === CartActions.CHANGE_LINE_ITEM_QUANTITY ||
      o.actionType === CartActions.REMOVE_LINE_ITEM,
  )
  @IsNotEmpty()
  @IsString()
  lineItemId: string;

  @ValidateIf((o) => o.actionType === CartActions.ADD_LINE_ITEM)
  @IsNotEmpty()
  @IsString()
  lineItemSKU: string;

  @IsOptional()
  cartId: string;

  @ValidateIf((o) => o.actionType === CartActions.CHANGE_LINE_ITEM_QUANTITY)
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ValidateIf(
    (o) =>
      o.actionType === CartActions.SET_BILLING_ADDRESS ||
      o.actionType === CartActions.SET_SHIPPING_ADDRESS,
  )
  @IsNotEmpty()
  address: AddressDraft;

  @ValidateIf(
    (o) =>
      o.actionType === CartActions.ADD_DISCOUNT_CODE ||
      o.actionType === CartActions.REMOVE_DISCOUNT_CODE,
  )
  @IsNotEmpty()
  @IsString()
  discountCode: string;

  getType() {
    return UpdateCartDTO;
  }
}
