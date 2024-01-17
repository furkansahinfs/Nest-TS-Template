import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

export class GetUsersFilterDTO {
  @IsNotEmpty()
  @IsNumberString()
  limit: string;

  @IsNotEmpty()
  @IsNumberString()
  offset: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

export class GetMeDTO {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
