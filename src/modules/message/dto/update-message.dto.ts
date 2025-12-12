import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-message.dto';



export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
