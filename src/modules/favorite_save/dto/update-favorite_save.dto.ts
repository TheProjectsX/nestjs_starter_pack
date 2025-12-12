import { PartialType } from '@nestjs/swagger';
import { CreateFavoriteSaveDto } from './create-favorite_save.dto';

export class UpdateFavoriteSaveDto extends PartialType(CreateFavoriteSaveDto) {}
