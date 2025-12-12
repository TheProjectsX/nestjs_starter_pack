
import { IsInt, IsOptional, IsString, Min, Max, IsMongoId, IsObject } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  taskId: string;  // The task that the review is associated with

  @IsInt()
  @Min(1)  // Rating should be between 1 and 5
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;  // Optional: The comment for the review

  @IsOptional()
  @IsMongoId()
  reviewReceiverId?: string;  // Optional: The ID of the trader receiving the review

  @IsOptional()
  @IsMongoId()
  reviewProviderId?: string;  // Optional: The ID of the trader providing the review
}

