import { Test, TestingModule } from '@nestjs/testing';
import { TaskApplicationService } from './task_application.service';

describe('TaskApplicationService', () => {
  let service: TaskApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskApplicationService],
    }).compile();

    service = module.get<TaskApplicationService>(TaskApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
