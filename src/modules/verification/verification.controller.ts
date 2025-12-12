import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

@Roles(Role.ADMIN, Role.TRADER)
@Post()
 async create(
  @Body() createVerificationDto: CreateVerificationDto,
  @Req() req: any
) {
  
  const user = req?.user;
  const result = await  this.verificationService.create(createVerificationDto, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Verification created successfully',
      data: result,
    });
  }

  @Get()
  findAll() {
    return this.verificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVerificationDto: UpdateVerificationDto) {
    return this.verificationService.update(+id, updateVerificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.verificationService.remove(+id);
  }
}
