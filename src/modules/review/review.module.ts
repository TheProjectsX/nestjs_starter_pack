import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, PrismaService,  PrismaHelperService],
})
export class ReviewModule {}
