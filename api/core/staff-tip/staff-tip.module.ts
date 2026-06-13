import { Module } from '@nestjs/common';
import { StaffTipService } from './staff-tip.service';

@Module({
  providers: [StaffTipService],
  exports: [StaffTipService],
})
export class StaffTipModule {}
