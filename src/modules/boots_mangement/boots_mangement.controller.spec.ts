import { Test, TestingModule } from '@nestjs/testing';
import { BootsMangementController } from './boots_mangement.controller';
import { BootsMangementService } from './boots_mangement.service';

describe('BootsMangementController', () => {
  let controller: BootsMangementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BootsMangementController],
      providers: [BootsMangementService],
    }).compile();

    controller = module.get<BootsMangementController>(BootsMangementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
