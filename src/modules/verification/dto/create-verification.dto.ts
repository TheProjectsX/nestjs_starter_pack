import { IsOptional, IsString } from "class-validator";

export class CreateVerificationDto {
    @IsOptional()
    @IsString()
    name: string

    @IsOptional()
    @IsString()
    email: string

    @IsOptional()
    @IsString()
    contactNo: string

    @IsOptional()
    @IsString()
    country: string

}

