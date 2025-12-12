import { Injectable } from '@nestjs/common';
import { CreateStripeDashboardTraderDto } from './dto/create-stripe_dashboard_trader.dto';
import { UpdateStripeDashboardTraderDto } from './dto/update-stripe_dashboard_trader.dto';
import { MarketplacePaymentService } from '@/payment/Stripe/marketplace.payment';
import { PrismaService } from '@/helper/prisma.service';

@Injectable()
export class StripeDashboardTraderService {


  constructor(
    private readonly marketplaceService: MarketplacePaymentService,
    private readonly prisma: PrismaService
  ) {}

  create(createStripeDashboardTraderDto: CreateStripeDashboardTraderDto) {
    return 'This action adds a new stripeDashboardTrader';
  }

 async findAll() {
  return true;
}

 async findOne(user: any) {
  const traderExite = await this.prisma.trader.findUnique({where: {userId: user.id}})
  if(!traderExite) return "User not found";
  const stripeAccounId = traderExite.stripeAccountId
  const result = await this.marketplaceService.stripeExpressConnectDashboard(stripeAccounId);
  return result
}

  update(id: number, updateStripeDashboardTraderDto: UpdateStripeDashboardTraderDto) {
    return `This action updates a #${id} stripeDashboardTrader`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripeDashboardTrader`;
  }
}
