import { Injectable } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription_plan.dto';
import { SuscriptionStripe } from '@/payment/Stripe/subcription.stripe';
import QueryBuilderIsrafil from '@/utils/queryBuilder';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import QueryBuilder from '@/utils/queryBuilder';

@Injectable()
export class SubscriptionPlanService {

  constructor(
    private readonly stripe: SuscriptionStripe,
    private readonly prisma: PrismaService,
    private readonly helper: PrismaHelperService
  ){}
 async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
 try{
   return await this.prisma.$transaction(async (tx) => {
    // 1. Check if plan already exists
    const isExistingPlan = await tx.subscriptionPlan.findUnique({
      where: {
        plan: createSubscriptionPlanDto.plan,
      },
    });

    if (isExistingPlan) {
      return "Plan already exists";
    }

    // 2. Create plan locally in DB
    const createdPlan = await tx.subscriptionPlan.create({
      data: {
        ...createSubscriptionPlanDto,
        description: createSubscriptionPlanDto.description ?? "",
        stripePriceId: "", 
      },
    });

    if (!createdPlan) {
      throw new Error("Local subscription plan creation failed");
    }

    // 3. Create product + price on Stripe
    const stripePlan = await this.stripe.createSubscriptionPlan({
      amount: createSubscriptionPlanDto.price,
      currency: createSubscriptionPlanDto.currency,
      interval: createSubscriptionPlanDto.interval,
      name: createSubscriptionPlanDto.name,
      discription: createSubscriptionPlanDto.description ?? "This is a description",
      matadata: {
        plan: createSubscriptionPlanDto.plan,
        trialPeriod: createSubscriptionPlanDto.trialPeriod,
        subscriptionPlanId : createdPlan?.id
      }
    });

    if (!stripePlan?.priceId) {
      throw new Error("Stripe plan creation failed");
    }

    // 4. Update DB plan with Stripe price ID
    const updatedPlan = await tx.subscriptionPlan.update({
      where: { id: createdPlan.id },
      data: {
        stripePriceId: stripePlan.priceId,
        stripeProductId: stripePlan.productId
      },
    });

    return updatedPlan;
  });
 }catch(error: unknown){
  console.log(error);
 }
}
async  findAll(query: Record<string, any>) {
    const queryBuilder = new QueryBuilder(query, this.prisma.subscriptionPlan);
    const result = await queryBuilder
      .filter([])
      .search([])
      .nestedFilter([])
      .sort()
      .paginate()
      .include({})
      .fields()
      .filterByRange([])
      .execute();

    const meta = await queryBuilder.countTotal();

    return { meta, data: result };

  }

async findOne(id: string) {
        const resutl = await this.prisma.subscriptionPlan.findUnique({where: {id}})
        return resutl
}

async  update(id: string, updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
  
  
    return await this.prisma.$transaction(async (tx) => {

    this.helper.validateEntityExistence("subscriptionPlan",id,
      "Subscription Plan not found"
    ) 

      const subscripiotnUpdate = await this.stripe.updateSubscriptionPlan({
        oldPriceId: updateSubscriptionPlanDto.stripePriceId,
        amount: updateSubscriptionPlanDto.price,
        currency: updateSubscriptionPlanDto.currency,
        interval: updateSubscriptionPlanDto.interval
      });


     const updatedPlan = await tx.subscriptionPlan.update({
       where: { id },
       data: {
         ...updateSubscriptionPlanDto,
         stripePriceId: subscripiotnUpdate.newPriceId,
         stripeProductId: subscripiotnUpdate.productId
       },
     }); 
      
     return updatedPlan

    })

    
  }

async  remove(id: string) {

    this.helper.validateEntityExistence("subscriptionPlan",id,
      "Subscription Plan not found"
    )

    await this.prisma.subscriptionPlan.delete({where: {id}});

    return "Subscription Plan Deleted Successfully"
}
}
