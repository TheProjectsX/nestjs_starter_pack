import { Module } from '@nestjs/common';

import { PrismaService } from '@/helper/prisma.service';
import { ChatController } from './message.controller';
import { ChatService } from './message.service';


@Module({
  controllers: [ChatController],
  providers: [ChatService,PrismaService],
})
export class MessageModule {}
