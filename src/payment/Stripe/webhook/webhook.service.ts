import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/helper/prisma.service';
import { PaymentType } from '@prisma/client';

@Injectable()
export class WebhookService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
    //   apiVersion: '2024-04-10',
    });
  }

  async handleEvent(event: Stripe.Event ) {
    console.log(
      `💰 Webhook received: ${event.type}`,
    );
    switch (event.type) {
      
      case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session?.metadata as any;
      const stripePaymentId = session?.payment_intent as string;

        //  one time payment handle here
        if(!session?.subscription){
          if(session?.payment_status === 'paid'){
            //  You can fetch subscription or customer from here
              if(metadata?.paymentType === "OnTimePayment_TaskApplication_Offer"){
                if(metadata?.task_applicationId){

                  await this.prisma.$transaction(async (tx) => {
                   // update task application
                  await tx.task_Application.update({
                    where: { id: metadata.task_applicationId },
                    data: { 
                      status:"APPROVED"
                     },
                   });

                   // update task
                   await tx.task.update({
                    where: { id: metadata.taskId },
                    data: { 
                      status:"ORDER_ACTIVE"
                     },
                   });

                   // create payment for task
                   await tx.payment.create({
                    data: {
                      paymentType: PaymentType.TASK_PAYMENT,
                      amount: session.amount_subtotal,
                      taskId: metadata.taskId,
                      currency: session.currency,
                      stripePaymentId: stripePaymentId,
                      paymentStatus: "ON_HOLD",
                    } as any,
                   })
                  })
                } 
              } // write others confition and logic

            // others one time payment hanlde here 
          }
        } else if(session?.subscription){   //  subscription payment handle here
        // You can fetch subscription or customer from here
        const subscriptionId = session?.subscription as string;
        const customerId = session?.customer as string;
        const expiuredAt = session?.expires_at as number;
        console.log(session,'session');
            if (session?.payment_status === 'paid') {
                if(metadata?.paymentType === "TRADER_SUBSCRIPTION_CREATED"){
                    await this.prisma.$transaction(async (tx) => {
                         // create subscription
                const subscription =    await tx.subscription.create({
                      data: {
                          subscriptionPlanId: metadata.subscriptionPlanId,
                          expiresAt: new Date(expiuredAt * 1000),
                          ownerId: metadata?.ownerId,
                          stripeSubscriptionId: subscriptionId ,
                          stripeCustomerId: customerId,
                          subscriptionStatus: 'ACTIVE',
                          cancelRequest: false,
                      },
                    });

                    //  create payment for subscription
                 const payment =   await tx.payment.create({
                      data: {
                        paymentOwnerId: metadata.ownerId,
                        paymentType: PaymentType.SUBSCRIPTION,
                        subscriptionPlanId: metadata.subscriptionPlanId,
                        currency: session.currency,
                        stripePaymentId: stripePaymentId,
                        amount: ( session.amount_subtotal / 100) ,
                        paymentStatus: "SUCCEEDED",
                      }
                    })

                    console.log(payment,'payment');
                    console.log(subscription,'subscription');
                    })
                 }
            }
        };

        break;
      }

      case 'transfer.updated': {
            const transfer = event.data.object as Stripe.Transfer;
            console.log(transfer,'transfer updated');
            console.log(`Transfer completed: ${transfer.id}, amount: ${transfer.amount}`);
            
            // Update your database to mark the transfer as complete, notify the user, etc.
            break;
        }

      case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice Payment Succeeded:', invoice);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;
        const expiredAt = subscription.cancel_at_period_end;
        const metadata = subscription.metadata || {};
        const isCancel = subscription.cancel_at_period_end;

        console.log('Subscription Updated:', subscription);
        console.log('Metadata:', metadata);
        console.log('Expired At:', expiredAt);
        console.log('Customer ID:', customerId);
        console.log('Subscription ID:', subscriptionId);

        await this.prisma.subscription.update({
          where: {
            id: metadata.subscriptionId, // Ensure metadata.subscriptionId contains the unique subscription id
          },
          data: {
            subscriptionStatus: isCancel ? 'CANCELLED' : 'ACTIVE',
            stripeSubscriptionId: subscriptionId,
            subscriptionPlanId: metadata.subscriptionPlanId,
          }
        })


        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        const subscriptionId = stripeSubscription.id;
        const customerId = stripeSubscription.customer as string;
        const expiredAt = stripeSubscription.cancel_at_period_end;
        const metadata = stripeSubscription.metadata || {};

        console.log('Subscription ID:', subscriptionId);
        console.log('Customer ID:', customerId);
        console.log('Expired At:', expiredAt);
        console.log('Metadata:', metadata);
        
        await this.prisma.subscription.update({
          where: {
            id: metadata.subscriptionId, 
          },
          data: {
            subscriptionStatus: 'CANCELLED',
            stripeSubscriptionId: subscriptionId,
            subscriptionPlanId: metadata.subscriptionPlanId,
          }
        })

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice);
        
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('⚠️ Trial Will End Soon for:', subscription.trial_end);

    
        break;
      }

      case "account.updated" :{
        const account = event.data.object as Stripe.Account;
        
        // 🔍 Handle event
        if (event.type === 'account.updated') {
          const account = event.data.object;

          if (
            account.details_submitted &&
            account.requirements.currently_due.length === 0 &&
            account.requirements.eventually_due.length === 0 &&
            account.requirements.past_due.length === 0
          ) {
            console.log(`Stripe account ${account.id} is verified!`);
            console.log(account,'checking account');

              this.prisma.user.update({
                where:{
                  stripeAccountId: account.id
                } as any,
                data:{
                  isVerified: true
                }
              });
          }
        }
 
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
