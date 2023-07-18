import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailingService {
  constructor(private readonly mailerService: MailerService) {}

  public sendConfirmRegistrationMail(to: string, code: string): Promise<any> {
    return this.mailerService
      .sendMail({
        to,
        from: process.env.MAILJET_MAILING_FROM,
        subject: 'Confirm Your Email Address',
        template: 'confirm-registration',
        context: {
          code,
        },
      })
      .catch((error) => {
        throw error;
      });
  }

  public sendRecoveryPasswordMail(
    to: string,
    temporaryPassword: string,
  ): Promise<any> {
    return this.mailerService
      .sendMail({
        to,
        from: process.env.MAILJET_MAILING_FROM,
        subject: 'Recovery Password',
        template: 'recovery-password',
        context: {
          temporaryPassword,
        },
      })
      .catch((error) => {
        throw error;
      });
  }
}
