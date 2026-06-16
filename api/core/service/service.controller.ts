import { Controller, Post, Body, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateServiceIsActiveDto } from './dto/update-service-is-active.dto';
import { AddServiceToPackageDto } from './dto/add-service-to-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto, @Req() req: any) {
    return this.serviceService.createService(createServiceDto, req);
  }

  @Post('add-to-package')
  async addServiceToPackage(@Body() addServiceToPackageDto: AddServiceToPackageDto) {
    return this.serviceService.addServiceToPackage(
      addServiceToPackageDto.packageId,
      addServiceToPackageDto.serviceId,
    );
  }

  @Patch(':id')
  async updateService(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.updateService(parseInt(id), updateServiceDto);
  }

  @Patch(':id/isActive')
  async updateServiceIsActive(
    @Param('id') id: string,
    @Body() updateServiceIsActiveDto: UpdateServiceIsActiveDto,
  ) {
    return this.serviceService.updateServiceIsActive(parseInt(id), updateServiceIsActiveDto.isActive);
  }

  @Post('search')
  async getAllServices(@Body() searchDto: any, @Req() req: any) {
    return this.serviceService.getAllServices(searchDto, req);
  }

  @Post('package/:packageId/search')
  async getServicesByPackageId(@Param('packageId') packageId: string) {
    return this.serviceService.getServicesByPackageId(parseInt(packageId));
  }
}
