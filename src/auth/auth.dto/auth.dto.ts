import {IsEmail, IsNotEmpty, IsOptional, MinLength} from 'class-validator'

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string; 
@IsOptional()
  profileImage?: string;
}


export class loginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

 

}



