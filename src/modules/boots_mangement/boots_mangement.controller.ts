import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { BootsMangementService } from './boots_mangement.service';
import { CreateBootsMangementDto } from './dto/create-boots_mangement.dto';
import { UpdateBootsMangementDto } from './dto/update-boots_mangement.dto';
import { ResponseService } from '@/utils/response';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';

@Controller('boots-mangement')
export class BootsMangementController {
  constructor(private readonly bootsMangementService: BootsMangementService) {}

  // Route for creating a new boots management entry
  @Post()
  @Roles(Role.ADMIN, Role.TRADER)
  async create(@Body() createBootsMangementDto: CreateBootsMangementDto) {
    const result = await this.bootsMangementService.create(createBootsMangementDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Boots Management Created Successfully',
      data: result,
    });
  }

  // Route for fetching all boots management records
  @Get()
  @Roles(Role.ADMIN, Role.TRADER)
  async findAll() {
    const result = await this.bootsMangementService.findAll();
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Boots Management Records Retrieved Successfully',
      data: result,
    });
  }

  // Route for fetching a specific boots management record by ID
  @Get(':id')
  @Roles(Role.ADMIN, Role.TRADER)
  async findOne(@Param('id') id: string) {
    const result = await this.bootsMangementService.findOne(+id);
    if (!result) {
      return ResponseService.formatResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Boots Management with ID ${id} not found`,
        data: null,
      });
    }
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Boots Management Retrieved Successfully',
      data: result,
    });
  }

  // Route for updating a boots management record by ID
  
  @Patch(':id')
  @Roles(Role.ADMIN, Role.TRADER)
  async update(
    @Param('id') id: string,
    @Body() updateBootsMangementDto: UpdateBootsMangementDto
  ) {
    const result = await this.bootsMangementService.update(+id, updateBootsMangementDto);
    if (!result) {
      return ResponseService.formatResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Boots Management with ID ${id} not found`,
        data: null,
      });
    }
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Boots Management Updated Successfully',
      data: result,
    });
  }

  // Route for deleting a boots management record by ID
  @Delete(':id')
  @Roles(Role.ADMIN, Role.TRADER)
  async remove(@Param('id') id: string) {
    const result = await this.bootsMangementService.remove(+id);
    if (!result) {
      return ResponseService.formatResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Boots Management with ID ${id} not found`,
        data: null,
      });
    }
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Boots Management Deleted Successfully',
      data: result,
    });
  }
}
