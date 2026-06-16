import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { HashUtil } from '../../shared/ultils/hash.util';
import { JwtService } from '../jwt/jwt.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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

  async login(email: string, password: string) {
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

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2,
        city: user.city,
        suburb: user.suburb,
        postCode: user.postCode,
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
}
