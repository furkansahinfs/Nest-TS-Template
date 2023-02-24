import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";

export class GetProductsFilterDTO {
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @IsOptional()
  productId?: string;
}
