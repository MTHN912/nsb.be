import { Controller, Post, Body, UseGuards, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LogoutResponseDto } from './dto/logout.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto.email, loginDto.password, res);
    
    return res.json({
      access_token: result.access_token,
      // refresh_token: result.refresh_token,
      user: result.user,
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user and clear client storage' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful. Client should clear localStorage and sessionStorage.',
    type: LogoutResponseDto 
  })
  async logout(@Req() req: Request, @Res() res: Response): Promise<Response> {
    this.authService.clearAuthCookies(res);
    await this.authService.logout(req);
    
    return res.json({
      message: 'LOGOUT_SUCCESS',
      clearStorage: true,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token from cookie' })
  @ApiResponse({ 
    status: 200, 
    description: 'Access token refreshed successfully.',
    type: RefreshTokenResponseDto 
  })
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.refreshTokens(req.cookies?.refresh_token, res);
    
    return res.json({
      access_token: result.access_token,
    });
  }
}
