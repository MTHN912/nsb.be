import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({ example: 'Full Set without Tip', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 45, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'Dipping powder full set without tip', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 60, required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ example: 'minutes', required: false })
  @IsString()
  @IsOptional()
  durationUnit?: string;
}
