import { Module } from '@nestjs/common';
import { StaffIncomeService } from './staff-income.service';
import { StaffIncomeController } from './staff-income.controller';
import { StaffCommissionModule } from '../staff-commission/staff-commission.module';
import { StaffTipModule } from '../staff-tip/staff-tip.module';

@Module({
  imports: [StaffCommissionModule, StaffTipModule],
  controllers: [StaffIncomeController],
  providers: [StaffIncomeService],
  exports: [StaffIncomeService],
})
export class StaffIncomeModule {}
