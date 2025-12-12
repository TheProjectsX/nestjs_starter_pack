import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CustomerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999999999)
  civilIdNo?: number;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  piece?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateCustomerDto {
  @ValidateNested()
  @Type(() => CustomerDto)
  trader: CustomerDto;

  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsString()
  contactNo: string;

  @IsEnum(Role)
  role: Role = Role.TRADER;
}
