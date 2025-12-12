import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query, Req } from '@nestjs/common';
import { RefferingService } from './reffering.service';
import { CreateRefferingDto } from './dto/create-reffering.dto';
import { UpdateRefferingDto } from './dto/update-reffering.dto';
import { ResponseService } from '@/utils/response';

@Controller('reffering')
export class RefferingController {
  constructor(private readonly refferingService: RefferingService) {}

  // Create a new Reffering entry
  @Post()
  async create(
    @Body() createRefferingDto: CreateRefferingDto,
    @Req() req: any
  ) {

    const user = req?.user;

    const response = await this.refferingService.create(createRefferingDto,user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Reffering Created Successfully',
      data: response,
    });
  }

  // Get all Reffering entries
  @Get()
  async findAll(
    @Query() query: Record<string, any>,
    @Req() req: any
  ) {
    const user = req?.user;
    const response = await this.refferingService.findAll(query, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Reffering Records Retrieved Successfully',
      data: response,
    });
  }

  // Get a specific Reffering entry by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await this.refferingService.findOne(id);
    if (!response) {
      return ResponseService.formatResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Reffering with ID ${id} not found`,
        data: null,
      });
    }
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Reffering Retrieved Successfully',
      data: response,
    });
  }

  // Update a Reffering entry by ID
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRefferingDto: UpdateRefferingDto) {
    const response = await this.refferingService.update(id, updateRefferingDto);
    if (!response) {
      return ResponseService.formatResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Reffering with ID ${id} not found`,
        data: null,
      });
    }
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Reffering Updated Successfully',
      data: response,
    });
  }

  // Delete a Reffering entry by ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const response = await this.refferingService.remove(id);
    if (!response) {
      return ResponseService.formatResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Reffering with ID ${id} not found`,
        data: null,
      });
    }
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Reffering Deleted Successfully',
      data: response,
    });
  }
}
