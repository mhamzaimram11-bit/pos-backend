import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { messages } from './auth.messages/auth.message';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { loginDto, SignupDto } from './auth.dto/auth.dto';
import { userStatus } from 'prisma/databases';
import { sendVerificationEmail } from 'src/email/mailer.service'; 

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

async sendCode(email: string) {
  const existingUser = await this.prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new BadRequestException('Email already exists');

 const verifiedCode = await this.prisma.verificationCode.findFirst({
    where: { email, verified: true },
  });


  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

  await this.prisma.verificationCode.deleteMany({ where: { email } });

  await this.prisma.verificationCode.create({
    data: { email, code, expiresAt },
  });

  await sendVerificationEmail(email, code);

  return { message: 'Verification code sent successfully.' };
}

async verifyCode(email: string, code: string) {
  const record = await this.prisma.verificationCode.findFirst({
    where: { email, code },
  });

  if (!record) throw new BadRequestException('Invalid code.');
  if (record.expiresAt < new Date())
    throw new BadRequestException('Code expired.');

  await this.prisma.verificationCode.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return { message: 'Email verified successfully.' };
}

async signup(dto: SignupDto) {
  const { email, password, name, profileImage } = dto;

  const verified = await this.prisma.verificationCode.findFirst({
    where: { email, verified: true },
  });

  if (!verified)
    throw new UnauthorizedException('Please verify your email first.');

  const existingUser = await this.prisma.user.findUnique({ where: { email } });
  if (existingUser)
    throw new UnauthorizedException(messages.USER_EMAIL_EXISTS);

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await this.prisma.user.create({
    data: { name, email, profileImage, password: hashedPassword },
  });

  await this.prisma.verificationCode.deleteMany({ where: { email } });

  return { message: 'User created successfully.', data: newUser };
}

async login(dto: loginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException(messages.USER_NOT_FOUND);
    }
    
    const userActive = await this.prisma.user.findFirst({
      where: { status: userStatus.Active },
    });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException(messages.INVALID_PASSWORD);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(messages.JWT_SECRET_UNDEFINED);
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });

    const data = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage || null,
      createdAt: user.createdAt,
    };

    return {
      token,
      data,
      message: messages.LOGIN_SUCCESS,
    };
  }

async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(messages.USER_NOT_FOUND);
    }

    const data = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage || null,
    };
    return {
      data,
      message: messages.USER_DATA,
    };
}

async getDetails() {
    const activeUsers = await this.prisma.user.findMany({
      where: { status: userStatus.Active },
      include: {
        sales: true,
      },
    });

   const sales = await this.prisma.product.findMany({
    include: {
      saleItems: {
        include: {
          product: true,
          
        },
      },
    },
  });

    const salesDetails = await this.prisma.sale.findMany({
      where: {
        user: {
          status: userStatus.Active,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });

    const totalSales = await this.prisma.saleItem.aggregate({
      _sum: {
        price: true,
      },
    });

    const totalSalesAmount = totalSales._sum.price || 0;

    const recentSales = await this.prisma.sale.findMany({
      take: 3,
      
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const data = {
      activeUsersLength: activeUsers.length,
      totalSalesAmount,
      totalProducts: sales.length,
      recentSales: recentSales,
    };
    return {
      data,
    };
}

}
