import { Module } from '@nestjs/common';
import { PackageServiceService } from './package-service.service';

@Module({
  providers: [PackageServiceService],
  exports: [PackageServiceService],
})
export class PackageServiceModule {}
