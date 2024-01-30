import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";
export class GetProductsFilterDTO {
  @ValidateIf((o) => !o.productIds)
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @ValidateIf((o) => !o.productIds)
  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @IsOptional()
  @IsString()
  productIds?: string;
}
