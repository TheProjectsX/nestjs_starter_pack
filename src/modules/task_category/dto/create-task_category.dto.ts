

import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsMongoId
} from 'class-validator';

export class CreateTaskCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsOptional()
  files?: string[];

  @IsString()
  @IsOptional()
  icon?: string;

  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @IsMongoId()
  @IsOptional()
  subCategoryid?: string;

}