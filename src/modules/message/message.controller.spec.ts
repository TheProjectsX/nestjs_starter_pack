import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './message.controller';
import { ChatService } from './message.service';

describe('MessageController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [ChatService],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
