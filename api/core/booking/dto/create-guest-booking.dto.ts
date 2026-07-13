import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { BaseBookingDto } from './base-booking.dto';
import { CustomerDetailsDto } from './customer-details.dto';

/**
 * POST /booking/guest - booking for a customer without an account.
 * Step 5 (Personal Details) is provided inline and used to resolve or
 * create the guest customer.
 */
export class CreateGuestBookingDto extends BaseBookingDto {
  @ApiProperty({
    type: CustomerDetailsDto,
    description: 'Step 5 - Personal Details of the guest customer.',
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CustomerDetailsDto)
  customer: CustomerDetailsDto;
}
