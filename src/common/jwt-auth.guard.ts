import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('You must be logged in with a valid token.');
    }
    return user;
}
}
