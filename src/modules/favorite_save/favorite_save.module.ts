import { Module } from '@nestjs/common';
import { FavoriteSaveService } from './favorite_save.service';
import { FavoriteSaveController } from './favorite_save.controller';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';

@Module({
  controllers: [FavoriteSaveController],
  providers: [FavoriteSaveService, PrismaService, PrismaHelperService],
})
export class FavoriteSaveModule {}
