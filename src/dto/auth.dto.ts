import { IsNotEmpty, Length } from "class-validator";

export class RegisterDTO {
  @IsNotEmpty()
  username: string;

  @Length(8)
  password: string;
}

export class LoginDTO {
  @IsNotEmpty()
  username: string;

  @Length(3)
  password: string;

  @IsNotEmpty()
  granty_type: "password";
}

export class RefreshTokenDTO {
  @IsNotEmpty()
  granty_type: "refresh";
}
