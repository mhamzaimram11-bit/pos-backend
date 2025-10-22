import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/jwt.stragety';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports : [PrismaModule,PassportModule],
})
export class AuthModule {}
