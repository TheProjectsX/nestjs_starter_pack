import { Module } from '@nestjs/common';
import { TaskManagementService } from './task_management.service';
import { TaskManagementController } from './task_management.controller';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [TaskManagementController],
  providers: [TaskManagementService, PrismaService, PrismaHelperService],
})
export class TaskManagementModule {}
