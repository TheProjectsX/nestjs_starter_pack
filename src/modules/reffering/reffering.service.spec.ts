import { Test, TestingModule } from '@nestjs/testing';
import { RefferingService } from './reffering.service';

describe('RefferingService', () => {
  let service: RefferingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefferingService],
    }).compile();

    service = module.get<RefferingService>(RefferingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
