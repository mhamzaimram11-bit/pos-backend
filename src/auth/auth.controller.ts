import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, SignupDto } from './auth.dto/auth.dto';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send_code')
  sendCode(@Body('email') email: string) {
    return this.authService.sendCode(email);
  }

  @Post('verify_code')
  verifyCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyCode(body.email, body.code);
  }

  @Post('signup')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Body() loginDto: loginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Get('details')
  @UseGuards(JwtAuthGuard)
  getdetails() {
    return this.authService.getDetails();
  }



}
