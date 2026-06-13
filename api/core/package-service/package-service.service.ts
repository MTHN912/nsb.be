import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PackageServiceService extends CrudService<any> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'packageService');
  }

  async createPackageService(data: any, params?: any, request?: any): Promise<any> {
    return this.create(data, params, request);
  }
}
