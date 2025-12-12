import { PartialType } from '@nestjs/swagger';
import { CreateTaskCategoryDto } from './create-task_category.dto';

export class UpdateTaskCategoryDto extends PartialType(CreateTaskCategoryDto) {}
