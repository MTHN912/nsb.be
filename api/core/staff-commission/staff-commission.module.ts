import { Module } from '@nestjs/common';
import { StaffCommissionService } from './staff-commission.service';

@Module({
  providers: [StaffCommissionService],
  exports: [StaffCommissionService],
})
export class StaffCommissionModule {}
