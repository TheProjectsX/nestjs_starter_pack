import { PartialType } from '@nestjs/swagger';
import { CreateBootsMangementDto } from './create-boots_mangement.dto';

export class UpdateBootsMangementDto extends PartialType(CreateBootsMangementDto) {}
