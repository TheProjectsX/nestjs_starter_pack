import { PartialType } from '@nestjs/swagger';
import { CreateTaskApplicationDto } from './create-task_application.dto';

export class UpdateTaskApplicationDto extends PartialType(CreateTaskApplicationDto) {}
