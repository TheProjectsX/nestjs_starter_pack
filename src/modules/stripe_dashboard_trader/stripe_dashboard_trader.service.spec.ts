import { Test, TestingModule } from '@nestjs/testing';
import { StripeDashboardTraderService } from './stripe_dashboard_trader.service';

describe('StripeDashboardTraderService', () => {
  let service: StripeDashboardTraderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeDashboardTraderService],
    }).compile();

    service = module.get<StripeDashboardTraderService>(StripeDashboardTraderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
