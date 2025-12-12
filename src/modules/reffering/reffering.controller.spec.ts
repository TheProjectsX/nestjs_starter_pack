import { Test, TestingModule } from '@nestjs/testing';
import { RefferingController } from './reffering.controller';
import { RefferingService } from './reffering.service';

describe('RefferingController', () => {
  let controller: RefferingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefferingController],
      providers: [RefferingService],
    }).compile();

    controller = module.get<RefferingController>(RefferingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
