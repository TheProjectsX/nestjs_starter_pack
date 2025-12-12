import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import * as fs from 'fs';
import * as express from 'express';
import { StripeSingleton } from './payment/Stripe/stripe.connection';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'euhan-nest',
      logLevels: ['error', 'warn', 'fatal'],
      timestamp: true,
      json: true,
    }),
    rawBody: true,
  });



  app.enableCors({
    origin: [
      "https://bajramasllani.vercel.app",
      'http://localhost:3000',
      'https://your-frontend-domain.com',
      'https://Bajram.code-commando.com',
      'https://www.darpm.site',
      'https://darpm.site',
      'https://Bajram-client.vercel.app',
      'https://bovila-frontend.vercel.app',
      "*"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
  });

  app.use('/api/v1/webhook', express.raw({ type: 'application/json' }));

  app.setGlobalPrefix('api/v1');


  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const port = configService.get<number>('port') || 5000;
  StripeSingleton.initialize(configService);

  const config = new DocumentBuilder()
    .setTitle('kmathew95_Server')
    .setDescription('The kmathew95_Server API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
