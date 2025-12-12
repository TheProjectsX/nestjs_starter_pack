import { Test, TestingModule } from '@nestjs/testing';
import { BootsMangementService } from './boots_mangement.service';

describe('BootsMangementService', () => {
  let service: BootsMangementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BootsMangementService],
    }).compile();

    service = module.get<BootsMangementService>(BootsMangementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
