import { IsNotEmpty, ValidateNested } from "class-validator";
import { User } from "src/types";

export abstract class Payload<T> {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  abstract dto: T;
  @IsNotEmpty()
  abstract user: User;
}
