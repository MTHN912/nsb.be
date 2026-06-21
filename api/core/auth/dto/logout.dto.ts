import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ example: 'LOGOUT_SUCCESS', description: 'Message indicating logout was successful' })
  message: string;

  @ApiProperty({ example: true, description: 'Flag indicating client should clear localStorage and sessionStorage' })
  clearStorage: boolean;
}
