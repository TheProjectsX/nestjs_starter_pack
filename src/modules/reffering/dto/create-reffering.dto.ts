import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRefferingDto {
  @IsString()
  @IsOptional()
  traderId: string; 

  @IsNumber()
  @IsOptional()
  referringCount?: number; 

  @IsString()
  @IsOptional()
  refferingId?: string; 

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;
}
