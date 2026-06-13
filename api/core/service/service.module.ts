import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { PackageModule } from '../package/package.module';
import { PackageServiceModule } from '../package-service/package-service.module';

@Module({
  imports: [PackageModule, PackageServiceModule],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
