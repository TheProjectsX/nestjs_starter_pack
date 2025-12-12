import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CustomerService } from './customer.service';

import { ResponseService } from '@/utils/response';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomFileFieldsInterceptor } from '@/helper/file_interceptor';
import { ParseFormDataInterceptor } from '@/helper/form_data_interceptor';
import { FileService } from '@/helper/file.service';
import { Role } from '@prisma/client';
import { IsPublic } from '../auth/auth.decorator';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly CustomerService: CustomerService,
    private readonly fileService: FileService,
  ) {}

  @IsPublic()
  @Get()
  async findAll(@Query() query: Record<string, any>) {
    const result = await this.CustomerService.findAll(query);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customers Found successfully',
      meta: result?.meta,
      data: result?.data,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.CustomerService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer Found successfully',
      data: result,
    });
  }

  @Patch(':id')

  @UseInterceptors(
    CustomFileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]),
    ParseFormDataInterceptor,
  )
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    let avatar: string | undefined;

    const uploadableFiles = files?.avatar;

    if (Array.isArray(uploadableFiles) && uploadableFiles.length > 0) {
      const uploaded =
        await this.fileService.uploadMultipleToDigitalOcean(uploadableFiles);
      avatar = uploaded[0];
    }

    const result = await this.CustomerService.update(
      id,
      updateCustomerDto,
      avatar,
    );
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer Updated successfully',
      data: result,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.CustomerService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Customer Deleted successfully',
      data: result,
    });
  }
}
