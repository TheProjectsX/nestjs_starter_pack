import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription_plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription_plan.dto';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('subscription-plan')
export class SubscriptionPlanController {
  constructor(private readonly subscriptionPlanService: SubscriptionPlanService) {}

@Post()
@Roles(Role.ADMIN,Role.SUPER_ADMIN)
async  create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    const createdSubscriptionPlan = await this.subscriptionPlanService.create(createSubscriptionPlanDto);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Plan Created Successfully',
      data: createdSubscriptionPlan
    })
  }


@Get()
@Roles(Role.ADMIN,Role.SUPER_ADMIN)
async findAll(
  @Query() query: Record<string, any>,
 ) {
    const response = await this.subscriptionPlanService.findAll(query);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Plan Found Successfully',
      data: response
    });
  }

@Get(':id')
@Roles(Role.ADMIN,Role.SUPER_ADMIN)
 async findOne(@Param('id') id: string) {
  console.log(id);
  
    const response = await this.subscriptionPlanService.findOne(id);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Plan Found Successfully',
      data: response
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN,Role.SUPER_ADMIN)
 async update(@Param('id') id: string, @Body() updateSubscriptionPlanDto: UpdateSubscriptionPlanDto) {
    const response = await this.subscriptionPlanService.update(id, updateSubscriptionPlanDto);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Plan Updated Successfully',
      data: response
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN,Role.SUPER_ADMIN)
 async remove(@Param('id') id: string) {
    const response = await this.subscriptionPlanService.remove(id);
    return ResponseService.formatResponse({
      statusCode: 200,
      message: 'Subscription Plan Deleted Successfully',
      data: response
    });
  }
}
