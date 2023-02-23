import { Optional } from "@nestjs/common";
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDTO {
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,}$/, {
    message:
      "Password must contain : at least one upper case letter, at least one lower case letter, at least one digit, a special character and minimum eight in length",
  })
  password: string;

  @Optional()
  firstName: string;

  @Optional()
  lastName: string;
}

export class LoginDTO {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  granty_type: "password";
}

export class RefreshTokenDTO {
  @IsNotEmpty()
  granty_type: "refresh";
}
