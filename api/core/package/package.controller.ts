import { Controller, Post, Body, Param, Req } from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  async create(@Body() createPackageDto: CreatePackageDto, @Req() req: any) {
    return this.packageService.createPackage(createPackageDto, req);
  }

  @Post('search')
  async getAllPackages(@Body() searchDto: any, @Req() req: any) {
    return this.packageService.getAllPackages(searchDto, req);
  }

  @Post(':id/search')
  async getPackageById(@Param('id') id: string) {
    return this.packageService.getPackageById(parseInt(id));
  }
}
