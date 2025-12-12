import { Injectable } from '@nestjs/common';
import { FileService } from '@/helper/file.service';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { AplicationStatus, PaymentStatus, TaskStatus } from '@prisma/client';



@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private prismaHelper: PrismaHelperService,
    private fileService: FileService,
  ) {}

async AdminAnalytics() {
  const now = new Date();

  // Start and end of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // --- Total monthly stats ---
  const totalTraders = await this.prisma.trader.count({
    where: { createdAt: { gte: startOfMonth, lte: endOfMonth } }
  });

  const totalTask = await this.prisma.task.count({
    where: { createdAt: { gte: startOfMonth, lte: endOfMonth } }
  });

  const totalRevenue = await this.prisma.payment.aggregate({
    where: {
      paymentStatus: PaymentStatus.SUCCEEDED,
      createdAt: { gte: startOfMonth, lte: endOfMonth }
    },
    _sum: { amount: true }
  });

  const totalPendingPayment = await this.prisma.payment.aggregate({
    where: {
      paymentStatus: PaymentStatus.ON_HOLD,
      createdAt: { gte: startOfMonth, lte: endOfMonth }
    },
    _sum: { amount: true }
  });

  // --- Daily trader registrations ---
  const dailyTraders = await this.prisma.trader.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
    _count: { _all: true },
  });

  // Format daily trader counts into day-based data
  const traderRegistrationsDaily = dailyTraders.map(t => ({
    date: t.createdAt.toISOString().split('T')[0],
    count: t._count._all
  }));

  // --- Daily sales ---
  const dailySales = await this.prisma.payment.groupBy({
    by: ['createdAt'],
    where: {
      paymentStatus: PaymentStatus.SUCCEEDED,
      createdAt: { gte: startOfMonth, lte: endOfMonth }
    },
    _count: { _all: true },
    _sum: { amount: true }
  });

  const salesDaily = dailySales.map(s => ({
    date: s.createdAt.toISOString().split('T')[0],
    count: s._count._all,
    totalAmount: s._sum.amount || 0
  }));

  // Return combined analytics
  return {
    totals: {
      totalTraders,
      totalTask,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPendingPayment: totalPendingPayment._sum.amount || 0,
    },
    dailyStats: {
      traderRegistrations: traderRegistrationsDaily,
      sales: salesDaily
    }
  };
}

  
async TraderAnalytics(user: any, ) {
  const now = new Date();

  // Check if trader exists
  const trader = await this.prisma.trader.findUnique({
    where: { userId: user.id }
  });

  if (!trader) return { error: "User not found" };

  // Start & end of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // --- 1. Total Task Bids Applied ---
  const bidsApplied = await this.prisma.task_Application.count({
    where: {
      offerId: trader.id,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
      status: { in: [AplicationStatus.APPROVED, AplicationStatus.IN_PROGRESS] }
    }
  });

  // --- 2. Total Task Bids Won (Tasks assigned to this trader with APPROVED status) ---
  const bidsWon = await this.prisma.task.count({
    where: {
      traderId: trader.id,
      status: TaskStatus.COMPLETED, // or APPROVED if you track it differently
      createdAt: { gte: startOfMonth, lte: endOfMonth }
    }
  });

  // --- 3. Reviews Received ---
  const reviewsAggregate = await this.prisma.review.aggregate({
    where: {
      reviewReceiverId: trader.id,
      createdAt: { gte: startOfMonth, lte: endOfMonth }
    },
    _count: { _all: true },
    _avg: { rating: true }
  });


const revenueStatistics = await this.prisma.payment.groupBy({
  by: ['createdAt'],
  where: {
    paymentStatus: PaymentStatus.SUCCEEDED,
    createdAt: { gte: startOfMonth, lte: endOfMonth },
    task: {
      traderId: trader.id // Filter by trader relation
    }
  },
  _sum: { amount: true },
  _count: { _all: true }
});


  
  return {
      bidsApplied,
      bidsWon,
      reviewsCount: reviewsAggregate._count._all,
      reviewsAvgRating: reviewsAggregate._avg.rating || 0,
      revenueStatices: revenueStatistics || [],
  }
    
 
}
}



