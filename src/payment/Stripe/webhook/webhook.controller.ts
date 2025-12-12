import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipRateLimit } from '@/utils/skip.ratelimite';
import { IsPublic } from '@/modules/auth/auth.decorator';

@IsPublic()
@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
    //   apiVersion: '2024-04-10',
    });
  }

  @Post()
  @SkipRateLimit()
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Forward the event to service for logic
    await this.webhookService.handleEvent(event);

    return res.status(HttpStatus.OK).json({ received: true });
  }

  @Get()
  @SkipThrottle()
  @SkipRateLimit()
  async handleWebhookGet(@Req() req: Request, @Res() res: Response, @Headers('stripe-signature') signature: string) {

    console.log(signature,'signature checking from webhook get');

    return res.status(HttpStatus.OK).json({ received: true });
  }
}
