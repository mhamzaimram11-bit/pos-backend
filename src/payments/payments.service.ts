import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: number, checkoutDto: CheckoutDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const productIds = checkoutDto.products.map((p) => p.id);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { createdBy: true },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    const saleItemsData = checkoutDto.products.map((p) => {
      const product = products.find((product) => product.id === p.id);
      if (!product) throw new NotFoundException(`Product ID ${p.id} not found`);
      return {
        productId: product.id,
        quantity: p.quantity,
        price: product.price,
        lineTotal: product.price * p.quantity,
      };
    });


    const totalAmount = saleItemsData.reduce((sum, i) => sum + i.lineTotal, 0);


    const sale = await this.prisma.sale.create({
      data: {
        userId,
        totalAmount,
        items: { create: saleItemsData },
        payments: {
          create: {
            paymentMethod: 'ONLINE',
            amount: totalAmount,
            status: 'COMPLETED',
          },
        },
      },
      include: {
        items: true,
      },
    });

    return {
      data: {
        saleId: sale.id,
        price: totalAmount,
        // lineTotal: totalAmount,
        item: sale.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          lineTotal: i.lineTotal,
          createdById: userId,
        })),
        user: {
          id: user.id,
          sellerName: user.name,
          email: user.email,
        },
      },
    };
  }

 async getAllInvoices() {
  const sales = await this.prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return sales.map((sale) => ({
    data: {
      saleId: sale.id,
      price: sale.totalAmount,
      lineTotal: sale.totalAmount,
      item: sale.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.product.name,
        quantity: i.quantity,
        // price: i.price,
        lineTotal: i.price * i.quantity,
        createdAt: i.product.createdAt,
        updatedAt: i.product.updatedAt,
        createdById: i.product.createdById,
      })),
      user: {
        id: sale.user.id,
        name: sale.user.name,
        email: sale.user.email,
      },
    },
  }));
}

}
