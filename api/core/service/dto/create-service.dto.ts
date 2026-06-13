import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'DIPPING_POWDER_FULL_SET_WITHOUT_TIP' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Full Set without Tip' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Dipping powder full set without tip', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

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

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
