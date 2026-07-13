import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateNested } from 'class-validator';
import { BaseBookingDto } from './base-booking.dto';
import { CustomerDetailsDto } from './customer-details.dto';

/**
 * POST /booking/admin - admin books on behalf of a customer.
 * Either reference an existing customer via `customerId`, or provide
 * Step 5 (Personal Details) via `customer` to create a new one.
 */
export class CreateAdminBookingDto extends BaseBookingDto {
  @ApiProperty({
    example: 1,
    required: false,
    description: 'Existing customer id. Provide this or `customer`.',
  })
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiProperty({
    type: CustomerDetailsDto,
    required: false,
    description:
      'Step 5 - Personal Details, used to create a new customer when `customerId` is absent.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDetailsDto)
  customer?: CustomerDetailsDto;
}
