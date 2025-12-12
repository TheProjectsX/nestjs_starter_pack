import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UploadedFiles, Req, ValidationPipe, UseInterceptors, Query } from '@nestjs/common';
import { TaskCategoryService } from './task_category.service';
import { CreateTaskCategoryDto } from './dto/create-task_category.dto';
import { UpdateTaskCategoryDto } from './dto/update-task_category.dto';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { FileService } from '@/helper/file.service';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';
import {IsPublic } from '../auth/auth.decorator';

@Controller('task-category')
export class TaskCategoryController {
  constructor(
    private readonly taskCategoryService: TaskCategoryService,
    private readonly fileService: FileService
  ) {}

  @Post('main')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'files', maxCount: 10 },
      { name: "icon", maxCount: 1 },
    ]),  // Handle file uploads
    ParseFormDataInterceptor,  // Handle form data parsing
  )
  async createCategory(
    @Body() createCategory: CreateTaskCategoryDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
   
    let fileUrls: string[] = [];
    if (files?.files) {
      fileUrls = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
    }

    let icon: string | null = null;

    if (files?.icon && files.icon[0]) {
          icon = `${process.env.SERVER_END_POINT}/files/${files.icon[0]?.filename}`; 
    }

    const result = await this.taskCategoryService.create({
      ...createCategory,
      files: fileUrls,  
      icon
    });

    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Category Created Successfully',
      data: result,
    });

  }

  @Post("sub")
  @Roles(Role.ADMIN)
  @UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'files', maxCount: 10 },
      { name: "icon", maxCount: 1 },
    ]),  
    ParseFormDataInterceptor,
  )
   async createSubCategory(
    @Body() createCategory: CreateTaskCategoryDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Req() req
  ) {
     
      let uploadedFiles: string[] = [];
      if (files?.files) {
        uploadedFiles = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
      }

      let icon: string | null = null;

      if (files?.icon && files.icon[0]) {
            icon = `${process.env.SERVER_END_POINT}/files/${files.icon[0]?.filename}`; 
      }

      const data = {
        ...createCategory,
        files: uploadedFiles,  
        icon: icon ? icon : null
      }

      const result = await this.taskCategoryService.createSubCategory({
        ...data
      });

      return ResponseService.formatResponse({
        statusCode: HttpStatus.OK,
        message: 'Task Sub Category Created Successfully',
        data: result
      })
    }


  
 @IsPublic()
 @Get("main")
 async findAll(
    @Query() query: Record<string, any>
  ) {
    const result = await this.taskCategoryService.findAll(query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Category Found Successfully',
      data: result
    })
  }

  
@IsPublic()
@Get("sub")
async findAllSubCategory(
    @Query() query: Record<string, any>
  ) {
    const result = await this.taskCategoryService.findAllSubCategory(query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Sub Category Found Successfully',
      data: result
    })
  }

  @IsPublic()
  @Get('main/:id')
 async findOne(@Param('id') id: string) {   
    const result = await this.taskCategoryService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Category Found Successfully',
      data: result
    })
  }

 @IsPublic()
 @Get('sub/:id')
 async findOneSubCategory(@Param('id') id: string) {   
    const result = await this.taskCategoryService.findOneBySubCategory(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Sub Category Found Successfully',
      data: result
    })
  }

  @Patch('main/:id')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'files', maxCount: 10 },
      { name: "icon", maxCount: 1 },
    ]), 
    ParseFormDataInterceptor,  
  )  
  async update(
  @Param('id') id: string,
  @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  @Body() updateTaskCategoryDto: UpdateTaskCategoryDto,
) {
  
  let fileUrls: string[] = [];
  if (files) {
    fileUrls = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
    updateTaskCategoryDto.files = fileUrls
  }


  const icon = updateTaskCategoryDto.icon
  if (icon) {
    updateTaskCategoryDto.icon = `${process.env.SERVER_END_POINT}/files/${files.files[0]?.filename}`; 
  }
  
  const result = await this.taskCategoryService.update(id, updateTaskCategoryDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Category Updated Successfully',
      data: result
    })
  }

  @Patch('sub/:id')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    CustomFileFieldsInterceptor([
      { name: 'files', maxCount: 10 },
      { name: "icon", maxCount: 1 },
    ]), 
    ParseFormDataInterceptor,  
  )  
  @Roles(Role.ADMIN)
 async updateSubCategory(
   @Param('id') id: string,
  @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  @Body() updateTaskCategoryDto: UpdateTaskCategoryDto,
) {
  
  let fileUrls: string[] = [];
  if (files) {
    fileUrls = files?.files?.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
    updateTaskCategoryDto.files = fileUrls
  }

  const icon = updateTaskCategoryDto.icon
  if (icon) {
    updateTaskCategoryDto.icon = `${process.env.SERVER_END_POINT}/files/${files.files[0]?.filename}`; 
  }
  
    const result = await this.taskCategoryService.updateSubCategory(id, updateTaskCategoryDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Sub Category Updated Successfully',
      data: result
    })
  }


  @Delete('main/:id')
  @Roles(Role.ADMIN)
 async remove(@Param('id') id: string) {
  const result = await this.taskCategoryService.remove(id);
  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
    message: 'Task Category Deleted Successfully',
    data: result
  });

}


  @Delete('sub/:id')
  @Roles(Role.ADMIN)
 async removeSubCategory(@Param('id') id: string) {
  const result = await this.taskCategoryService.removeSubCategory(id);
  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
    message: 'Task Sub Category Deleted Successfully',
    data: result
  });

}
}
