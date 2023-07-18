import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UsersDocument } from '../user/model/user.model';
import { Model } from 'mongoose';
import { IConfirmationRegisterCode } from '../core/interfaces/auth.model';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy'
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { Response } from 'express';
import { AuthConfirmEmailPostDto } from './dto/auth-confirm-email.post.dto';
import { AuthRegisterPostDto } from './dto/auth-register-post.dto';
import { UserHelperService } from '../core/services/user-helper.service';
import { MailingService } from '../mailing/mailing.service';


@Injectable()
export class AuthService {
  private confirmationRegisterCodes = new Map<
    string,
    IConfirmationRegisterCode
    >();

  constructor(
    @InjectModel(User.name)
    private model: Model<UsersDocument>,
    private userHelperService: UserHelperService,
    private jwtService: JwtService,
    private mailingService: MailingService,
  ) {}

  public async register(requestBody: AuthRegisterPostDto): Promise<void> {
    const { userName, password, email, code } = requestBody;
    console.log(userName, password, email, code)

    const storedConfirmationCode = this.confirmationRegisterCodes.get(email);
    const dateNow = new Date();
    const isCodeValid =
      storedConfirmationCode?.expire_date >= dateNow &&
      code === storedConfirmationCode.code;

    if (isCodeValid) {
      this.confirmationRegisterCodes.delete(email);
    } else {
      throw new ConflictException('Secret code in wrong or expired');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.model({
      userName,
      email,
      password: hashedPassword,
    });

    try {
      await user.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendConfirmationRegisterCode({
                                       email,
                                     }: AuthConfirmEmailPostDto): Promise<void> {
    this.removeExpiredConfirmTokens();
    const userInDataBase = await this.userHelperService.findUserByEmail({
      email,
    });

    if (userInDataBase) {
      throw new ConflictException('User already exists');
    }

    /*
    expire_date for 15 minutes
     */

    const expire_date = new Date(Date.now() + 900000);

    const confirmationCode: IConfirmationRegisterCode = {
      expire_date,
      code: Math.random().toString(36).substring(2, 8),
    };

    try {
      const mail = await this.mailingService.sendConfirmRegistrationMail(
        email,
        confirmationCode.code,
      );
      console.log(mail, 'mail')

      this.confirmationRegisterCodes.set(email, confirmationCode);
      console.log(this.confirmationRegisterCodes.values(), 'codes')
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  public addCookiesToResponse(response: Response): void {
    const crf = randomBytes(20).toString('hex');

    response.cookie('csrftoken', this.createExpiredSignedToken(crf), {
      httpOnly: false,
      maxAge: 86400000,
    });
  }

  private removeExpiredConfirmTokens(): void {
    const dateNow = new Date();
    [...this.confirmationRegisterCodes.entries()].forEach(([key, value]) => {
      if (value.expire_date >= dateNow) {
        this.confirmationRegisterCodes.delete(key);
      }
    });
  }

  public createExpiredSignedToken(csrfToken: string): string {
    return this.jwtService.sign(
      {
        csrfToken,
      },
      {
        expiresIn: '1d',
        secret: process.env.JWT_SECRET_KEY,
        algorithm: 'HS256',
      },
    );
  }

  public generateSecret2FaKey() {
    return speakeasy.generateSecret({ length: 32 }).base32;
  }
}
