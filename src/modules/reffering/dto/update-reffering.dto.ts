import { PartialType } from '@nestjs/swagger';
import { CreateRefferingDto } from './create-reffering.dto';

export class UpdateRefferingDto extends PartialType(CreateRefferingDto) {}
