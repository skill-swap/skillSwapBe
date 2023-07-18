import { Module } from '@nestjs/common';

import { MailingService } from './mailing.service';

@Module({
  imports: [],
  exports: [],
  controllers: [],
  providers: [MailingService],
})
export class MailingModule {}
