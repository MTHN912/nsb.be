import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { HashUtil } from '../../shared/ultils/hash.util';
import { JwtService } from '../jwt/jwt.service';
import { User } from '@prisma/client';
import { LogoutResponseDto } from './dto/logout.dto';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('AUTH.INVALID_CREDENTIALS');
    }

    const isPasswordValid = await HashUtil.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('AUTH.INVALID_CREDENTIALS');
    }

    return user;
  }

  async login(email: string, password: string, res?: Response) {
    const user = await this.validateUser(email, password);

    if (!user.isActive) {
      throw new UnauthorizedException('AUTH.USER_ACCOUNT_INACTIVE');
    }

    await this.userService.updateUserLastLogin(user.id);

    const roles = (user as any).roles || [];
    const roleCodes = roles.map((r: any) => r.role?.code).filter(Boolean);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roleCodes,
      dealerId: user.dealerId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' });

    const oldRefreshToken = await this.redisService.get(`user_refresh_token:${user.id}`);
    if (oldRefreshToken) {
      await this.redisService.del(`refresh_token:${oldRefreshToken}`);
    }

    const refreshTokenExpiresIn = parseInt(this.configService.get('JWT_REFRESH_EXPIRES_IN'));
    await this.redisService.set(`refresh_token:${refreshToken}`, user.id.toString(), refreshTokenExpiresIn);
    
    await this.redisService.set(`user_refresh_token:${user.id}`, refreshToken, refreshTokenExpiresIn);

    if (res) {
      this.setAuthCookies(res, accessToken, refreshToken);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles: roleCodes,
        dealerId: user.dealerId,
      },
    };
  }

  async logout(): Promise<LogoutResponseDto> {
    return {
      message: 'LOGOUT_SUCCESS',
      clearStorage: true,
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    this.setAccessTokenCookie(res, accessToken);
    
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('COOKIE_SECURE') === 'true',
      sameSite: 'strict',
      maxAge: parseInt(this.configService.get('COOKIE_REFRESH_TOKEN_MAX_AGE') || '2592000000'),
    });
  }

  private setAccessTokenCookie(res: Response, accessToken: string): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.configService.get('COOKIE_SECURE') === 'true',
      sameSite: 'strict',
      maxAge: parseInt(this.configService.get('COOKIE_ACCESS_TOKEN_MAX_AGE') || '86400000'),
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  async refreshTokens(refreshToken: string | null, res?: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('AUTH.REFRESH_TOKEN_REQUIRED');
    }

    try {
      const decoded = await this.jwtService.verify(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('AUTH.INVALID_REFRESH_TOKEN');
      }

      const userId = await this.redisService.get(`refresh_token:${refreshToken}`);
      
      if (!userId) {
        throw new UnauthorizedException('AUTH.INVALID_REFRESH_TOKEN');
      }

      const user = await this.userService.findOne(
        { id: parseInt(userId) },
        { include: { roles: { include: { role: true } }, dealer: true }, throwNotFound: false },
      );
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('AUTH.USER_ACCOUNT_INACTIVE');
      }

      const roles = (user as any).roles || [];
      const roleCodes = roles.map((r: any) => r.role?.code).filter(Boolean);

      const payload = {
        sub: user.id,
        email: user.email,
        roles: roleCodes,
        dealerId: user.dealerId,
      };

      const newAccessToken = this.jwtService.sign(payload);

      if (res) {
        this.setAccessTokenCookie(res, newAccessToken);
      }

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('AUTH.INVALID_REFRESH_TOKEN');
    }
  }
}
