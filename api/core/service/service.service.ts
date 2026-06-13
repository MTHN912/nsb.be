import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { PackageService } from '../package/package.service';
import { PackageServiceService } from '../package-service/package-service.service';

@Injectable()
export class ServiceService extends CrudService<any> {
  constructor(
    protected prisma: PrismaService,
    private readonly packageService: PackageService,
    private readonly packageServiceService: PackageServiceService,
  ) {
    super(prisma, 'service');
  }

  async createService(data: any, request?: any): Promise<any> {
    return this.create(data, {}, request);
  }

  async addServiceToPackage(packageId: number, serviceId: number): Promise<any> {
    const pkg = await this.packageService.findOne(
      { id: packageId },
      { throwNotFound: true },
    );

    if (!pkg) {
      throw new NotFoundException('PACKAGE.NOT_FOUND');
    }

    const service = await this.findOne({ id: serviceId }, { throwNotFound: false });

    if (!service) {
      throw new NotFoundException('SERVICE.NOT_FOUND');
    }

    const existingRelation = await this.packageServiceService.findOne(
      { packageId, serviceId },
      { throwNotFound: false },
    );

    if (existingRelation) {
      throw new BadRequestException('PACKAGE_SERVICE.ALREADY_EXISTS');
    }

    return this.packageServiceService.createPackageService(
      {
        packageId,
        serviceId,
      },
      {
        include: {
          package: true,
          service: true,
        },
      },
    );
  }

  async updateService(
    id: number,
    data: {
      name?: string;
      price?: number;
      description?: string;
      currency?: string;
      duration?: number;
      durationUnit?: string;
    },
  ): Promise<any> {
    return this.update(id, data);
  }

  async updateServiceIsActive(id: number, isActive: boolean): Promise<any> {
    return this.update(id, { isActive });
  }

  async getAllServices(searchDto: any, request?: any): Promise<{ data: any[]; total: number }> {
    return this.findAll(
      {
        where: searchDto?.where,
        orderBy: searchDto?.orderBy,
        skip: searchDto?.skip,
        take: searchDto?.take,
      },
      request,
    );
  }

  async getServicesByPackageId(packageId: number): Promise<any[]> {
    const pkg = await this.packageService.findOne(
      { id: packageId },
      {
        include: {
          packageServices: {
            include: {
              service: true,
            },
          },
        },
      },
    );

    if (!pkg) {
      throw new NotFoundException('PACKAGE.NOT_FOUND');
    }

    return pkg.packageServices.map((ps) => ps.service);
  }
}
