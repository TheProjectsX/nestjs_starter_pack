import { IsOptional } from "class-validator";

export class CreateSubscriptionDto {
    @IsOptional()
    userId: string;
    
    @IsOptional()
    subscriptionPlanId: string;
}
