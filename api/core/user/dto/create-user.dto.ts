import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsInt, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Manhattan', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  dealerId?: number;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ example: 'male', required: false })
  @IsString()
  @IsOptional()
  gender?: string;
}
