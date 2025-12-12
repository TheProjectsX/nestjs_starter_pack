import { Test, TestingModule } from '@nestjs/testing';
import { TaskApplicationController } from './task_application.controller';
import { TaskApplicationService } from './task_application.service';

describe('TaskApplicationController', () => {
  let controller: TaskApplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskApplicationController],
      providers: [TaskApplicationService],
    }).compile();

    controller = module.get<TaskApplicationController>(TaskApplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
