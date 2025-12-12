// src/subscription/dto/create-subscription-plan.dto.ts

import { SubscribePlan } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateSubscriptionPlanDto {

  @IsOptional()
  currency?: string;

  @IsOptional()
  interval?: 'month' | 'year';
        
  @IsEnum(SubscribePlan)
  @IsOptional()
  plan?: SubscribePlan;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  featuresList?: string[];

  @IsBoolean()
  @IsOptional()
  trialPeriod?: boolean;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  stripePriceId?: string;
}
