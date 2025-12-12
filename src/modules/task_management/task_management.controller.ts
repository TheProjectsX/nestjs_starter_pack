import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UseInterceptors, UploadedFiles, Query, Req } from '@nestjs/common';
import { TaskManagementService } from './task_management.service';
import {  CreateTaskManagementDto } from './dto/create-task_management.dto';
import { UpdateTaskManagementDto } from './dto/update-task_management.dto';
import { ResponseService } from '@/utils/response';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { IsPublic } from '../auth/auth.decorator';

@Controller('task-management')
export class TaskManagementController {
  constructor(private readonly taskManagementService: TaskManagementService) {}

@Post()
@Roles(Role.ADMIN, Role.TRADER)
@UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'files', maxCount: 10 }
    ]), 
    ParseFormDataInterceptor,  

)  
 async create(
  @Body() createTaskManagementDto: CreateTaskManagementDto,
  @UploadedFiles() files: Record<string, Express.Multer.File[]>,
) {

  let fileUrls: string[] = [];
  if (files) {
    fileUrls = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
  }
  
  const result = await this.taskManagementService.create({
    ...createTaskManagementDto,
    files: fileUrls ? fileUrls : []
  }as any);

  return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Management Created Successfully',
      data: result
    })
  }
 

@IsPublic()
@Get()
 async findAll(
  @Query() query: Record<string, any>,
  @Req() req: any
 ) {
    const result = await this.taskManagementService.findAll(query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Management Found Successfully',
      data: result
    });
  }

@Roles(Role.ADMIN, Role.TRADER)
@Get("privet-all")
 async getPrivetTaskAll(
  @Query() query: Record<string, any>,
  @Req() req: any
 ) {
    const user = req?.user;
    const result = await this.taskManagementService.getTaskWithPrivetAll(query,user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Management Deleted Successfully',
      data: result
    });
}

@IsPublic()
//  @Roles(Role.ADMIN, Role.TRADER)
 @Get(':id')
 async findOne(@Param('id') id: string) {
    const result = await this.taskManagementService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Management Found Successfully',
      data: result
    });
  }

@Roles(Role.ADMIN, Role.TRADER)
@Patch(':id')
@UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'files', maxCount: 10 },
      { name: "icon", maxCount: 1 },
    ]), 
    ParseFormDataInterceptor,  

)
 async update(
  @Param('id') id: string,
  @Body() updateTaskManagementDto: UpdateTaskManagementDto,
  @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
  let fileUrls: string[] = [];
  if (files) {
    fileUrls = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
  }
    const result = await this.taskManagementService.update(id, {...updateTaskManagementDto, files: fileUrls ? fileUrls : []}as any);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Management Updated Successfully',
      data: result
    });
  }

@Roles(Role.ADMIN, Role.TRADER)
@Delete(':id')
async remove(@Param('id') id: string) {
    const result = await this.taskManagementService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Management Deleted Successfully',
      data: result
    });
  }

}
