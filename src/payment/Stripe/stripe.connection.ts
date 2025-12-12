// src/payment/Stripe/stripe.connection.ts
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

// Reusable Stripe Singleton
export class StripeSingleton {
  private static instance: Stripe;

  static initialize(configService: ConfigService): void {
    if (!StripeSingleton.instance) {
      const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
      if (!secretKey) throw new Error('Stripe Secret Key not found');
      StripeSingleton.instance = new Stripe(secretKey, {});
    }
  }

  static getClient(): Stripe {
    if (!StripeSingleton.instance) {
      throw new Error('Stripe client not initialized. Call initialize() first.');
    }
    return StripeSingleton.instance;
  }
}
