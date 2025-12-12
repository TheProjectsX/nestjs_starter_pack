import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SuscriptionStripe } from '@/payment/Stripe/subcription.stripe';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import QueryBuilder from '@/utils/queryBuilder';
import { Subscription } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly suscriptionStripe: SuscriptionStripe,
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelperService
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, user: any) {
    return this.prisma.$transaction(async (tx) => {
      try {

        const isExiteUser = await tx.user.findUnique({
          where: { id: user.id },
          include: { trader: true }
        });

        if (!isExiteUser) throw new NotFoundException('User not found');
        if (!isExiteUser?.trader.isVerified) throw new ForbiddenException('User is not verified');
        if (!isExiteUser?.trader) throw new NotFoundException('Trader profile not found');

        // 2️⃣ Validate Subscription Plan
        const plan = await tx.subscriptionPlan.findFirst({
          where: { stripePriceId: createSubscriptionDto.subscriptionPlanId } as any
        });
        if (!plan) throw new NotFoundException('Subscription plan not found');

        // 3️⃣ Check existing subscriptions
        const alreadySubscribed = await tx.subscription.findFirst({
          where: { ownerId: isExiteUser.trader.id }
        });

        if (alreadySubscribed) throw new BadRequestException('User already subscribed to a plan');

        // 4️⃣ Create Stripe Subscription Session
        const subscriptionSession = await this.suscriptionStripe.createSubscription({
          subscriptionType: 'sesstion',
          email: isExiteUser.email,
          priceId: plan.stripePriceId,
          description: plan.description ?? 'Subscription Plan',
          metadata: {
            subscriptionPlanId: plan.id,
            ownerId: isExiteUser.trader.id,
            paymentType: 'TRADER_SUBSCRIPTION_CREATED'
          }
        });

        return { success: true, session: subscriptionSession };
      } catch (error) {
        console.error('Create subscription failed:', error);
        throw new InternalServerErrorException(
          error instanceof Error ? error.message : 'Failed to create subscription'
        );
      }
    });
  }

  async findAll(query: Record<string, any>, user: any) {
    try {
      const isAdmin = user.role === 'ADMIN';
      const trader = await this.prisma.trader.findUnique({ where: { userId: user.id } });

      const queryBuilder = new QueryBuilder(query, this.prisma.subscription);

      const result = await queryBuilder
        .filter()
        .search([])
        .nestedFilter([])
        .sort()
        .rawFilter(isAdmin ? {} : { ownerId: trader?.id })
        .paginate()
        .include({})
        .fields()
        .filterByRange([])
        .execute();

      const meta = await queryBuilder.countTotal();
      return { success: true, meta, data: result };
    } catch (error) {
      console.error('Find all subscriptions failed:', error);
      throw new InternalServerErrorException('Failed to retrieve subscriptions');
    }
  }

  
async findAllByAdmin(query: Record<string, any>, user: any ){

  const queryBuilder = new QueryBuilder(query, this.prisma.subscription);
  const result = await queryBuilder
    .filter(["ownerId"])
    .search(["ownerId"])
    .nestedFilter([])
    .sort()
    .paginate()
    .include({})
    .fields()
    .filterByRange([])
    .execute();
  const meta = await queryBuilder.countTotal();
  return { success: true, meta, data: result };
}

  async findOne(id: string) {
    await this.prismaHelper.validateEntityExistence('subscription', id, 'Subscription not found');
    return this.prisma.subscription.findUnique({ where: { id } });
  }

  async update(id: string, updateSubscriptionDto: any) {
    try {
      const subscription: Subscription = await this.prismaHelper.validateEntityExistence(
        'subscription',
        id,
        'Subscription not found'
      );

      return this.suscriptionStripe.updateSubscription({
        subscriptionId: subscription.stripeSubscriptionId
      });
    } catch (error) {
      console.error('Update subscription failed:', error);
      throw new InternalServerErrorException('Failed to update subscription');
    }
  }

  async remove(id: string) {
    await this.prismaHelper.validateEntityExistence('subscription', id, 'Subscription not found');

    try {
      return this.suscriptionStripe.cancelSubscription({ subscriptionId: id });
    } catch (error) {
      console.error('Cancel subscription failed:', error);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }
}
