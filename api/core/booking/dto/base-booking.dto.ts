import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Shared booking steps that are common to every booking flow
 * (customer, guest and admin):
 *   - Step 1: Select Your Ritual  -> serviceIds
 *   - Step 2: Choose Your Artist  -> staffId
 *   - Step 3: Select Date + Step 4: Choose Time Slot -> bookingDate
 */
export class BaseBookingDto {
  @ApiProperty({
    example: [1, 2],
    description: 'Step 1 - Select Your Ritual: selected service id(s).',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  serviceIds: number[];

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Step 2 - Choose Your Artist: selected staff (User) id.',
  })
  @IsInt()
  @IsOptional()
  staffId?: number;

  @ApiProperty({
    example: '2026-08-01T14:30:00.000Z',
    description:
      'Step 3 & 4 - Select Date and Choose Time Slot combined into a single ISO date-time.',
  })
  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiProperty({ example: 'Please prepare warm water', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
