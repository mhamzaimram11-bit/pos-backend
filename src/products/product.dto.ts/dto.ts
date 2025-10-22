import { IsEmail, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class createProduct {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;
}
