import { Test, TestingModule } from '@nestjs/testing';
import { StripeDashboardTraderController } from './stripe_dashboard_trader.controller';
import { StripeDashboardTraderService } from './stripe_dashboard_trader.service';

describe('StripeDashboardTraderController', () => {
  let controller: StripeDashboardTraderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeDashboardTraderController],
      providers: [StripeDashboardTraderService],
    }).compile();

    controller = module.get<StripeDashboardTraderController>(StripeDashboardTraderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
