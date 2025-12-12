import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

@Roles(Role.ADMIN, Role.TRADER)
@Post()
 async create(
  @Body() createSubscriptionDto: CreateSubscriptionDto,
  @Req() req: any
) {

    const user  = req?.user;
    const response = await  this.subscriptionService.create(createSubscriptionDto, user);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Created Successfully',
      data: response
    });
  }

 @Roles(Role.ADMIN, Role.SUPER_ADMIN , Role.TRADER)
 @Get()
 async findAll(
  @Query() query: Record<string, any>,
  @Req() req: any
 ) {
    const user = req?.user;
    console.log(user, 'user');
    const response = await  this.subscriptionService.findAll(query, user);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscriptions Found Successfully',
      data: response
    });
  }

  @Roles(Role.ADMIN)
  @Get('/admin')
  async findAllByAdmin(
    @Query() query: Record<string, any>,
    @Req() req: any
  ){
      const user = req?.user;
      const response = await  this.subscriptionService.findAllByAdmin(query, user);
      return ResponseService.formatResponse({
        statusCode: 200,
        message: 'Subscriptions Found Successfully',
        data: response
      });
  }

  @Get(':id')
 async findOne(@Param('id') id: string) {
    const response = await this.subscriptionService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Found Successfully',
      data: response
    });
  
  }

  @Patch(':id')
 async update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    const response = await this.subscriptionService.update(id, updateSubscriptionDto);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Updated Successfully',
      data: response
    });
  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
    const response = await this.subscriptionService.remove(id);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Deleted Successfully',
      data: response
    });
  }
}
