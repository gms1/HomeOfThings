import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  shortName: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}