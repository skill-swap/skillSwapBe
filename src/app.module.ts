import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_SERV),
    ThrottlerModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: 'in-v3.mailjet.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAILJET_MAILING_USER,
          pass: process.env.MAILJET_MAILING_PASS,
        },
      },
      defaults: {
        from: process.env.MAILJET_MAILING_FROM,
      },
      template: {
        dir: join(process.cwd(), 'src/mailing/templates'),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [
    ThrottlerGuard,
  ],
  exports: []
})
export class AppModule {}
