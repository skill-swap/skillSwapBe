import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
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

    return super.canActivate(context);
  }
}
