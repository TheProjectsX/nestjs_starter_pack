import { Module } from '@nestjs/common';
import { StripeDashboardTraderService } from './stripe_dashboard_trader.service';
import { StripeDashboardTraderController } from './stripe_dashboard_trader.controller';
import { MarketplacePaymentService } from '@/payment/Stripe/marketplace.payment';
import { PrismaService } from '@/helper/prisma.service';

@Module({
  controllers: [StripeDashboardTraderController],
  providers: [StripeDashboardTraderService, MarketplacePaymentService, PrismaService],
})
export class StripeDashboardTraderModule {}
