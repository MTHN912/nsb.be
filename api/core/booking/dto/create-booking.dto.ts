import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { BaseBookingDto } from './base-booking.dto';

/**
 * POST /booking - booking for a customer that already has an account.
 * Step 5 (Personal Details) is resolved from the existing customer record.
 */
export class CreateBookingDto extends BaseBookingDto {
  @ApiProperty({ example: 1, description: 'Existing customer id.' })
  @IsInt()
  @IsNotEmpty()
  customerId: number;
}
