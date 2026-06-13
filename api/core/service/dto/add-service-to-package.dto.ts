import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class AddServiceToPackageDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  packageId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;
}
