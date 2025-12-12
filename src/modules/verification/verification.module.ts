import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { StripeService } from '@/payment/Stripe/intent.payment';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { MarketplacePaymentService } from '@/payment/Stripe/marketplace.payment';
import { StripeSingleton } from '@/payment/Stripe/stripe.connection';

@Module({
  controllers: [VerificationController],
  providers: [VerificationService, PrismaService, PrismaHelperService, MarketplacePaymentService]
})
export class VerificationModule {}
