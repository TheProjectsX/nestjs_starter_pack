import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteSaveService } from './favorite_save.service';

describe('FavoriteSaveService', () => {
  let service: FavoriteSaveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteSaveService],
    }).compile();

    service = module.get<FavoriteSaveService>(FavoriteSaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
