import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { APP_FILTER } from '@nestjs/core';
import * as path from 'path';
import { PrismaModule } from './core/prisma/prisma.module';
import { JwtModule } from './core/jwt/jwt.module';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './core/user/user.module';
import { ServiceModule } from './core/service/service.module';
import { PackageModule } from './core/package/package.module';
import { StaffIncomeModule } from './core/staff-income/staff-income.module';
import { BookingModule } from './core/booking/booking.module';
import { RedisModule } from './core/redis/redis.module';
import { LoggerModule } from './core/logger/logger.module';
import { I18nExceptionFilter } from './shared/filters/i18n-exception.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Internationalization
    I18nModule.forRoot({
      fallbackLanguage: process.env.DEFAULT_LANGUAGE || 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'api', 'i18n'),
        watch: true,
      },
    }),

    // Core modules
    PrismaModule,
    JwtModule,
    AuthModule,
    UserModule,
    ServiceModule,
    PackageModule,
    StaffIncomeModule,
    BookingModule,
    RedisModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useFactory: (i18n: I18nService) => new I18nExceptionFilter(i18n),
      inject: [I18nService],
    },
  ],
})
export class AppModule {}