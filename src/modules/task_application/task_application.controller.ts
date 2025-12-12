import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { TaskApplicationService } from './task_application.service';
import { CreateTaskApplicationDto } from './dto/create-task_application.dto';
import { UpdateTaskApplicationDto } from './dto/update-task_application.dto';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';

@Controller('task-application')
export class TaskApplicationController {
  constructor(
    private readonly taskApplicationService: TaskApplicationService,
    private readonly prismaService: PrismaService,
    private readonly prismaHelper: PrismaHelperService
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.TRADER)
  async create(
    @Body() createTaskApplicationDto: CreateTaskApplicationDto,
    @Req() req: any
  ) {

    const user = req?.user;
    const reponse = await  this.taskApplicationService.create(createTaskApplicationDto, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Application Created Successfully',
      data: reponse
    })
  }

  @Get("offer")
  @Roles(Role.TRADER, Role.ADMIN)
 async  OfferTaskFindAll(
    @Query() query: Record<string, any>,
    @Req() req: any,
  ) {
  const user = req?.user;
  console.log(user, 'user');
  const result = await this.taskApplicationService.OfferAll(query, user);
  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
    message: 'Task Application Found Successfully',
    data: result
  })


}

 @Get("request")
 @Roles(Role.TRADER, Role.ADMIN)
 async  ReestTaskFindAll(
    @Query() query: Record<string, any>,
    @Req() req: any,
  ) {



  const user = req?.user;
  const result = await this.taskApplicationService.RequestAll(query, user);
  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
    message: 'Task Application Found Successfully',
    data: result
  })
}

@Get("history")
@Roles(Role.TRADER, Role.ADMIN)
async  HistoryTaskFindAllByTrader(
    @Query() query: Record<string, any>,
    @Req() req: any, 
  ) {
      const user = req?.user;
      const result = await this.taskApplicationService.HistoryAllByTrader(query, user);
      return ResponseService.formatResponse({
        statusCode: HttpStatus.OK,
        message: 'Task Application Found Successfully',
        data: result
      })
  }


@Get("delivery")
@Roles(Role.TRADER, Role.ADMIN)
async findingDeliveryTaskAll(
  @Query() query: Record<string, any>,
  @Req() req: any
){
  const user = req?.user;
  const result = await this.taskApplicationService.findingDeliveryTaskAll(query, user);
  return ResponseService.formatResponse({
    statusCode: HttpStatus.OK,
    message: 'Task Application Found Successfully',
    data: result
  })
}

  @Get('offer/:id')
  @Roles(Role.TRADER, Role.ADMIN)
 async findOneOffer(
  @Param('id') id: string,
  @Req() req: any
) {
    const user = req?.user;
    const result = await this.taskApplicationService.findOneOffer(id,user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Application Found Successfully',
      data: result
    })
  }


  @Get('request/:id')
  @Roles(Role.TRADER, Role.ADMIN)
 async findOneRequest(
  @Param('id') id: string,
) {
    const result = await this.taskApplicationService.findOneRequest(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Application Found Successfully',
      data: result
    })
  }


  @Patch('offer/:id')
  @Roles(Role.TRADER, Role.ADMIN)
  async  updateOneOffer(@Param('id') id: string, @Body() updateTaskApplicationDto: UpdateTaskApplicationDto) {
    const result = await  this.taskApplicationService.updateOffer(id, updateTaskApplicationDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Application Updated Successfully',
      data: result
    })
  }



  @Patch('request/:id')
  @Roles(Role.TRADER, Role.ADMIN)
  @UseInterceptors(
     CustomFileFieldsInterceptor([
       { name: 'files', maxCount: 10 },
       { name: "icon", maxCount: 1 },
     ]), 
     ParseFormDataInterceptor,  
   ) 
  async  updateOneRequest(
    @Param('id') id: string, 
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @Body() updateTaskApplicationDto: UpdateTaskApplicationDto
  ) {

   let fileUrls: string[] = [];
  if (files) {
    fileUrls = files.files.map((file) => `${process.env.SERVER_END_POINT}/files/${file.filename}`);
  }

  updateTaskApplicationDto.provide_attachments = fileUrls

    const result = await  this.taskApplicationService.updateRequest(id, updateTaskApplicationDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Application Updated Successfully',
      data: result
    })
  }

  @Patch("approve-delivery/:id")
  @Roles(Role.TRADER, Role.ADMIN)
  async approveDelivery(@Param('id') id: string) {

    const result = await  this.taskApplicationService.approveDelivery(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Task Application Updated Successfully',
      data: result
    })
  }


  @Delete(':id')
  @Roles(Role.TRADER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.taskApplicationService.remove(id);
  }
}
