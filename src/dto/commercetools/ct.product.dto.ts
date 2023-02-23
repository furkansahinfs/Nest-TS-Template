import { IsNotEmpty } from "class-validator";

export class GetProductDTO {
  @IsNotEmpty()
  productId: string;
}
