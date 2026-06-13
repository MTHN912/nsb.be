import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: 'DIPPING_POWDER_PACKAGE' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Dipping Powder Package' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Package containing all dipping powder services', required: false })
  @IsString()
  @IsOptional()
  description?: string;

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
