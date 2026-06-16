import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { StaffIncomeService } from './staff-income.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('income')
@UseGuards(JwtAuthGuard)
export class StaffIncomeController {
  constructor(private readonly staffIncomeService: StaffIncomeService) {}

  @Post()
  async createIncome(@Body() createIncomeDto: any, @Req() req: any) {
    return this.staffIncomeService.createIncome(createIncomeDto);
  }

  @Post('search')
  async searchIncome(@Body() searchDto: any, @Req() req: any) {
    return this.staffIncomeService.searchIncome(searchDto, req);
  }
}
