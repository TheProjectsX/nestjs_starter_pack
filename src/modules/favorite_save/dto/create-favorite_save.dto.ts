import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { FavouriteType } from '@prisma/client'; 

export class CreateFavoriteSaveDto {
  @IsEnum(FavouriteType)
  type: FavouriteType;  

  @IsString()
  traderOwnerId: string; 

  @IsOptional()
  @IsString()
  favoriteByTraderId?: string;  

  @IsOptional()
  @IsString()
  taskId?: string;  

  @IsOptional()
  @IsObject()
  task?: any; 
}
