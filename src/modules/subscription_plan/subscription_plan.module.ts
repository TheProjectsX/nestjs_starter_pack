import { Module } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription_plan.service';
import { SubscriptionPlanController } from './subscription_plan.controller';
import { SuscriptionStripe } from '@/payment/Stripe/subcription.stripe';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionPlanService, SuscriptionStripe, PrismaService, PrismaHelperService],
})
export class SubscriptionPlanModule {}
