import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { IsPublic } from '../auth/auth.decorator';
import { ResponseService } from '@/utils/response';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';


@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(Role.ADMIN)
  @Get(`admin`)
  // @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async AdminAnalytics() {
    const result = await this.analyticsService.AdminAnalytics();
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: `Admin Overview Analyticss found successfully`,
      data: result,
    });
  }

  
  @Get("trader")
  @Roles(Role.TRADER)
  async TraderAnalytics(
    @Query() query: Record<string, any>,
    @Req() req: any
  ) {
    
    const user = req?.user;

    const result = await this.analyticsService.TraderAnalytics(user);
    return ResponseService.formatResponse({
      statusCode: HttpStatus.OK,
      message: `Admin Economic Analyticss found successfully`,
      data: result,
    });
  }
}

