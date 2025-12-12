import Stripe from "stripe";
import { StripeSingleton } from "./stripe.connection";
import { ConfigService } from "@nestjs/config";

export class MarketplacePaymentService {
    private stripe: Stripe;

  constructor() {
    // this.stripe = new Stripe('STRIPE_SECRET_KEY');

    StripeSingleton.initialize( new ConfigService)
    
    this.stripe = StripeSingleton.getClient();
 
  }
  
async createPaymentWithSession({ taskId, buyerId, amount, paymentType , task_applicationId}: { taskId: string; buyerId: string; amount: number; paymentType: string , task_applicationId: string }) {
    try {
 const session = await this.stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
            {
            price_data: {
                currency: 'usd',
                product_data: {
                name: 'Task Payment',
                description: 'Payment for task',
                images: [
                    'https://example.com/image1.jpg',
                    'https://example.com/image2.jpg',
                ],
                metadata: {
                    taskId: taskId
                },
                },
                unit_amount: amount * 100,
            },
            quantity: 1,
            },
        ],
  metadata: {
      taskId: taskId,
      buyerId: buyerId,
      task_applicationId: task_applicationId,
      paymentType: paymentType ?? "Unknown"
  },
  mode: 'payment', 
  success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.CLIENT_URL}/cancel`,
});

return { 
    sessionId: session.id,
    sessionUrl : session.url
  };
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async transferMoney({ taskId, traderAccountId, amount , paymentType = "paymentTransfer" }: { taskId: string; traderAccountId: string; amount: number , paymentType: string }) {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: amount * 100,
        currency: 'usd',
        destination: traderAccountId, 
        transfer_group: `group_${taskId}`,
        metadata: {
          taskId: taskId,
          paymentType: paymentType
        },
      });

      return transfer;
    } catch (error) {
      console.log(error,'checking error ', error.message);
      throw new Error(`Failed to transfer money: ${error.message}`);
    }
  }


  async createAccountLink(traderAccountId: string) {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: traderAccountId,
        refresh_url: `${process.env.CLIENT_URL}/retry`,
        return_url: `${process.env.CLIENT_URL}/done`, 
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      throw new Error(`Failed to create account link: ${error.message}`);
    }
  }

  async stripeExpressConnectDashboard (traderAccountId: string) {
     try{
      const loginLink = await this.stripe.accounts.createLoginLink(traderAccountId);
      return loginLink.url;
    }catch (error) {
      throw new Error(`Failed to create account link: ${error.message}`);
    }
  }
}