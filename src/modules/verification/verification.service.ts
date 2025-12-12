import { Injectable } from '@nestjs/common';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { StripeSingleton } from '@/payment/Stripe/stripe.connection';
import { MarketplacePaymentService } from '@/payment/Stripe/marketplace.payment';
import Stripe from 'stripe';

@Injectable()
export class VerificationService {
  private stripe: Stripe;
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelperService,
    private readonly marketplaceService: MarketplacePaymentService,
  ) {
      this.stripe  =  StripeSingleton.getClient()
  }

  async create(createVerificationDto: CreateVerificationDto, tokenUser: any) {
  try {
    // 1. Get user with trader relation
    const user = await this.prisma.user.findUnique({
      where: { email: tokenUser.email },
      include: { trader: true },
    });

    if (!user) {
      throw new Error('User not found');
    }
    if (!user.trader) {
      throw new Error('Trader profile not found for this user');
    }

    // 2. If no Stripe account yet, create one
    if (!user.trader.stripeAccountId) {
      const account = await this.stripe.accounts.create({
        type: 'express',
        email: user.email,
        country: 'US',
        tos_acceptance: {
          service_agreement: 'full',
        },
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: 'individual',
      });

      // Save Stripe account ID
      await this.prisma.trader.update({
        where: { id: user.trader.id },
        data: { stripeAccountId: account.id },
      });

      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.CLIENT_URL}/stripe/refresh`,
        return_url: `${process.env.CLIENT_URL}/stripe/return`,
        type: 'account_onboarding',
      });

      return {
        status: 'onboarding_required',
        onboardingUrl: accountLink.url,
        accountLink,
      };
    }

    // 3. If Stripe account exists, check status
    const account = await this.stripe.accounts.retrieve(user.trader.stripeAccountId);

    if (account.details_submitted && account.charges_enabled) {
      return { status: 'verified', canPayout: true };
    }

    // If not verified, send onboarding link again
    const accountLink = await this.stripe.accountLinks.create({
      account: user.trader.stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/stripe/refresh`,
      return_url: `${process.env.CLIENT_URL}/stripe/return`,
      type: 'account_onboarding',
    });

    return {
      status: 'onboarding_required',
      onboardingUrl: accountLink.url,
      accountLink,
    };
  } catch (error) {
    console.error('Stripe verification error:', error);

    // Return structured error response
    return {
      status: 'error',
      message: error.message || 'Something went wrong during verification',
    };
  }
}


  // Optional CRUDs
  findAll() {
    return `This action returns all verification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} verification`;
  }

  update(id: number, updateVerificationDto: UpdateVerificationDto) {
    return `This action updates a #${id} verification`;
  }

  remove(id: number) {
    return `This action removes a #${id} verification`;
  }
}
