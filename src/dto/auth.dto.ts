import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ROLES } from "src/enums";

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,}$/, {
    message:
      "Password must contain : at least one upper case letter, at least one lower case letter, at least one digit, a special character and minimum eight in length",
  })
  password: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEnum(ROLES)
  role: string;
}

export class LoginDTO {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  granty_type: "password";
}

export class RefreshTokenDTO {
  @IsNotEmpty()
  granty_type: "refresh";
}
