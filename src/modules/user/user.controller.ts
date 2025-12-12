
import { ResponseService } from '@/utils/response';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { CreateUserAdminDto } from './dto/create-admin.dto';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';



@Controller('users')
export class UsersController {
constructor(private readonly usersService: UserService) {}
@Roles(Role.ADMIN)
@Post('create-admin')
async  createAdmin(@Body() createAdminDto: CreateUserAdminDto) {
    const result = await  this.usersService.createAdmin(createAdminDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'user created successfully',
      data: result,
    })
  }

  @Roles(Role.ADMIN)
  @Get('/')
  async getUsers(@Req() req: Request) {
 
    const result = await this.usersService.getMany(
      req?.query as Record<string, string>,
    );

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'user retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }
}
