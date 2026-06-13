import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from 'nestjs-i18n';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './core/prisma/prisma.module';
import { JwtModule } from './core/jwt/jwt.module';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './core/user/user.module';
import { ServiceModule } from './core/service/service.module';
import { PackageModule } from './core/package/package.module';
import { StaffIncomeModule } from './core/staff-income/staff-income.module';
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
        path: './api/i18n/',
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
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: I18nExceptionFilter,
    // },
  ],
})
export class AppModule {}