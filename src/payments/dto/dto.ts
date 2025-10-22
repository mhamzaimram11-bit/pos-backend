import { IsArray, ArrayNotEmpty, IsInt, Min } from 'class-validator';

class ProductItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @IsArray()
  @ArrayNotEmpty()
  products: ProductItemDto[];
}