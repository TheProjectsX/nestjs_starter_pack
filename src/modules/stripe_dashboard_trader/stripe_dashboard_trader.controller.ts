import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req } from '@nestjs/common';
import { StripeDashboardTraderService } from './stripe_dashboard_trader.service';
import { CreateStripeDashboardTraderDto } from './dto/create-stripe_dashboard_trader.dto';
import { UpdateStripeDashboardTraderDto } from './dto/update-stripe_dashboard_trader.dto';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('stripe-dashboard-trader')
export class StripeDashboardTraderController {
  constructor(private readonly stripeDashboardTraderService: StripeDashboardTraderService) {}

  @Post()
 async create(@Body() createStripeDashboardTraderDto: CreateStripeDashboardTraderDto) {
    const response = await  this.stripeDashboardTraderService.create(createStripeDashboardTraderDto);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Stripe Dashboard Trader Created Successfully',
      data: response
    })
  }

@Roles(Role.TRADER)
@Get()
async  findAll() {
    const response = await this.stripeDashboardTraderService.findAll();
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Stripe Dashboard Trader Found Successfully',
      data: response
    })
}


  @Get(':id')
 async findOne(
  @Param('id') id: string,
  @Req() req: any
) {
    const user = req?.user;
    const response = await this.stripeDashboardTraderService.findOne(user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: 'Stripe Dashboard Trader Found Successfully',
      data: response
    })
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStripeDashboardTraderDto: UpdateStripeDashboardTraderDto) {
    return this.stripeDashboardTraderService.update(+id, updateStripeDashboardTraderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stripeDashboardTraderService.remove(+id);
  }
}
