import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createProduct } from './product.dto.ts/dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: createProduct, userId: number) {
    const Product = await this.prisma.product.create({
      data: {
        ...dto,
        createdById: userId,
      },
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true,
      },
    });
    return { Product, messsage: `Created Successfully` };
  }

  async getAllProducts() {
    const data = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true,
      },
    });
    return { data, message: `Fetched Successfully` };
  }
  async deleteProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });
    return { message: `Deleted Successfully` };
  }
}
