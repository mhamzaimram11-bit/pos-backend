import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CheckoutDto } from './dto/dto';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private PaymentsService: PaymentsService) {}

  @Post('checkout')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  checkout(@Req() req, @Body() checkoutDto: CheckoutDto) {
    return this.PaymentsService.checkout(req.user.id, checkoutDto);
  }

  @Get('allInvoices')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  getAllInvoices() {
    return this.PaymentsService.getAllInvoices();
  }
}
