import { IsArray, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTaskApplicationDto {
    
    @IsOptional()
    @IsMongoId()
    applicantId?: string

    @IsOptional()
    @IsMongoId()
    taskId?: string

    @IsNumber()
    @IsOptional()
    amount?: number

    @IsOptional()
    @IsMongoId()
    offerId?: string

    @IsOptional()
    attachment?: string

    @IsOptional()
    description?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })  
    provide_attachments?: string[];
}



