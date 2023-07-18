import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CrfCookieGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const csrfTokenFromCookies = request.cookies['csrftoken'];
    const csrfTokenFromHeaders = request.headers['x-csrftoken'];

    try {
      if (
        !csrfTokenFromCookies ||
        !csrfTokenFromHeaders ||
        csrfTokenFromCookies !== csrfTokenFromHeaders ||
        !this.jwtService.verify(csrfTokenFromCookies, {
          secret: process.env.JWT_SECRET_KEY,
        })
      ) {
        throw new Error();
      }
    } catch (e) {
      throw new UnauthorizedException('Signature has expired');
    }

    return true;
  }
}
