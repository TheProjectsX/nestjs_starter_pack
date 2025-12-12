import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SuscriptionStripe } from '@/payment/Stripe/subcription.stripe';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService, PrismaHelperService, SuscriptionStripe]
})
export class SubscriptionModule {}
