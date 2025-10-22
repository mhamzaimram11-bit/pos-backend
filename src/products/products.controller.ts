import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';
import { createProduct } from './product.dto.ts/dto';
import { ProductsService } from './products.service';
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly ProductsService: ProductsService) {}

  @Post('create')
  createProduct(@Req() req, @Body() dto: createProduct) {
    return this.ProductsService.createProduct(dto, req.user.id);
  }
  @Get('all')
  getProducts() {
    return this.ProductsService.getAllProducts();
  }

  @Delete('delete/:id')
  deleteProduct(
    @Param('id', ParseIntPipe) productId: number,

  ) {
    return this.ProductsService.deleteProduct(productId);
  }
}
