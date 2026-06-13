import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffCommissionService extends CrudService<any> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'staffCommission');
  }

  async createCommission(data: any): Promise<any> {
    return this.create(data);
  }
}
