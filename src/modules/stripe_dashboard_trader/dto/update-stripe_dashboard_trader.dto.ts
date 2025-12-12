import { PartialType } from '@nestjs/swagger';
import { CreateStripeDashboardTraderDto } from './create-stripe_dashboard_trader.dto';

export class UpdateStripeDashboardTraderDto extends PartialType(CreateStripeDashboardTraderDto) {}
