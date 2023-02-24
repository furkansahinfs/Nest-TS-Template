import { LineItemDraft } from "@commercetools/platform-sdk";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";

export class GetCartsFilterDTO {
  @IsOptional()
  cartId?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;
}

export class CreateCartDTO {
  @IsNotEmpty()
  userId: string;

  products?: LineItemDraft[];
}

export class UpdateCartDTO {
  @IsNotEmpty()
  products: LineItemDraft[];

  @IsNotEmpty()
  cartId: string;
}
