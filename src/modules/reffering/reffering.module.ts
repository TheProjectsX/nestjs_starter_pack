import { Module } from '@nestjs/common';
import { RefferingService } from './reffering.service';
import { RefferingController } from './reffering.controller';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [RefferingController],
  providers: [RefferingService,PrismaService, PrismaHelperService],
})
export class RefferingModule {}
