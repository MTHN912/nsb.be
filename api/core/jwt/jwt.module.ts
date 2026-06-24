import { Module, Global, forwardRef } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './jwt.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [
    PassportModule,
    UserModule,
    forwardRef(() => AuthModule),
    NestJwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN},
    }),
  ],
  providers: [JwtService, JwtStrategy, LocalStrategy],
  exports: [JwtService],
})
export class JwtModule {}
