import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteSaveController } from './favorite_save.controller';
import { FavoriteSaveService } from './favorite_save.service';

describe('FavoriteSaveController', () => {
  let controller: FavoriteSaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteSaveController],
      providers: [FavoriteSaveService],
    }).compile();

    controller = module.get<FavoriteSaveController>(FavoriteSaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
