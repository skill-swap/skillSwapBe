import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindUserByEmailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
