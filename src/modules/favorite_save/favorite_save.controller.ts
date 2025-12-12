import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query, Req } from '@nestjs/common';
import { FavoriteSaveService } from './favorite_save.service';
import { CreateFavoriteSaveDto } from './dto/create-favorite_save.dto';
import { UpdateFavoriteSaveDto } from './dto/update-favorite_save.dto';
import { PrismaService } from '@/helper/prisma.service';
import { PrismaHelperService } from '@/utils/is_existance';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import QueryBuilder from '@/utils/queryBuilder';

@Controller('favorite-save')
export class FavoriteSaveController {
  constructor(
    private readonly favoriteSaveService: FavoriteSaveService,
    private readonly prisma: PrismaService,
    private readonly prismaHelper: PrismaHelperService
  ) {}

@Post()
@Roles(Role.ADMIN, Role.TRADER)
async create(@Body() createFavoriteSaveDto: CreateFavoriteSaveDto) {
    const result = await  this.favoriteSaveService.create(createFavoriteSaveDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Favorite Save Created Successfully',
      data: result
    })
  }

  @Get()
  @Roles(Role.ADMIN, Role.TRADER)
 async findAll(
    @Query() query: Record<string, any>,
    @Req() req: any,
  ) {

    const user = req?.user;
    const result = await this.favoriteSaveService.findAll(query, user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Favorite Save Found Successfully',
      data: result
    })
    
  }

  @Get(':id')
async findOne(@Param('id') id: string) {

    const result = await this.favoriteSaveService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Favorite Save Found Successfully',
      data: result
    })

  }

  @Patch(':id')
 async update(@Param('id') id: string, @Body() updateFavoriteSaveDto: UpdateFavoriteSaveDto) {

    const result = await this.favoriteSaveService.update(id, updateFavoriteSaveDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Favorite Save Updated Successfully',
      data: result
    })
}

  @Delete(':id')
 async remove(@Param('id') id: string) {

    const result = await this.favoriteSaveService.remove(id);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Favorite Save Deleted Successfully',
      data: result
    })

}
}
