import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InternalServerErrorException } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const whiteList = process.env.CORS_ALLOWED_URLS
    ? process.env.CORS_ALLOWED_URLS.split(',')
    : [];

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || whiteList.indexOf(requestOrigin) !== -1) {
        callback(null, true);
      } else {
        callback(new InternalServerErrorException('Not allowed by CORS'));
      }
    },
  });
  app.use(cookieParser());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('SkillSwap example')
    .setDescription('The SkillSwap Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
