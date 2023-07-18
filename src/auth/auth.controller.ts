import {
  Body,
  Controller,
  HttpCode,
  Post, UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthRegisterPostDto } from './dto/auth-register-post.dto';
import { AuthConfirmEmailPostDto } from './dto/auth-confirm-email.post.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('/register')
  @HttpCode(201)
  @ApiResponse({})
  async register(
    @Body(ValidationPipe) body: AuthRegisterPostDto,
  ): Promise<void> {
    return await this.authService.register(body);
  }

  @Throttle(4, 3600)
  @Post('/register-confirm-email')
  @UseGuards(ThrottlerGuard)
  @HttpCode(201)
  @ApiResponse({})
  async registerConfirmEmail(
    @Body(ValidationPipe) body: AuthConfirmEmailPostDto,
  ): Promise<void> {
    return this.authService.sendConfirmationRegisterCode(body);
  }
}
