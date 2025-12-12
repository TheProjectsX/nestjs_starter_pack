import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberType, RoomType } from '@prisma/client';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RoomType, default: RoomType.GROUP })
  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;
}


export class AddUserToRoomDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  addedBy: string;

  @ApiProperty({ enum: MemberType, default: MemberType.MEMEBER})
  @IsOptional()
  @IsEnum(MemberType)
  role?: MemberType;
}