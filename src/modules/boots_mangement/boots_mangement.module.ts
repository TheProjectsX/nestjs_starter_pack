import { Module } from '@nestjs/common';
import { BootsMangementService } from './boots_mangement.service';
import { BootsMangementController } from './boots_mangement.controller';

@Module({
  controllers: [BootsMangementController],
  providers: [BootsMangementService],
})
export class BootsMangementModule {}
