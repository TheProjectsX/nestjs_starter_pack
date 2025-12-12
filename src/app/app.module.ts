import { PrismaService } from '@/helper/prisma.service';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { BcryptService } from '@/utils/bcrypt.service';
import { GlobalExceptionFilter } from '@/utils/global_exception';
import { WebsocketGateway } from '@/ws/socket.io.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import config from '../config';
import { AppController } from './app.controller';
import { AdminModule } from '@/modules/admin/admin.module';
import { FileService } from '@/helper/file.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { UserService } from '@/modules/user/user.service';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { WebhookModule } from '@/payment/Stripe/webhook/webhook.module';
import { MessageModule } from '@/modules/message/message.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { RefferingModule } from '@/modules/reffering/reffering.module';
import { ReviewModule } from '@/modules/review/review.module';
import { SubscriptionModule } from '@/modules/subscription/subscription.module';
import { TaskManagementModule } from '@/modules/task_management/task_management.module';
import { CustomerModule } from '@/modules/trader/customer.module';
import { VerificationModule } from '@/modules/verification/verification.module';
import { StripeSingleton } from '@/payment/Stripe/stripe.connection';
import { SubscriptionPlanModule } from '@/modules/subscription_plan/subscription_plan.module';
import { TaskCategoryModule } from '@/modules/task_category/task_category.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TaskApplicationModule } from '@/modules/task_application/task_application.module';
import { FavoriteSaveModule } from '@/modules/favorite_save/favorite_save.module';
import { StripeDashboardTraderModule } from '@/modules/stripe_dashboard_trader/stripe_dashboard_trader.module';
import { BootsMangementModule } from '@/modules/boots_mangement/boots_mangement.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'tmp'),
      serveRoot: '/tmp',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 100,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 1000,
        },
        {
          name: 'long',
          ttl: 600000,
          limit: 1000,
        },
      ],
    }),
    AuthModule,
    UserModule,
    AdminModule,
    AnalyticsModule,
    WebhookModule,
    MessageModule,
    PaymentModule,
    RefferingModule,
    ReviewModule,
    SubscriptionModule,
    TaskManagementModule,
    CustomerModule,
    SubscriptionPlanModule,
    VerificationModule,
    TaskCategoryModule,
    TaskApplicationModule,
    FavoriteSaveModule,
    StripeDashboardTraderModule,
    BootsMangementModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    UserService,
    BcryptService,
    FileService,
    PrismaHelperService,

    // WebSocketService,
    WebsocketGateway,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard }
  ]
})
export class AppModule {}
