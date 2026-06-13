import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffTipService extends CrudService<any> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'staffTip');
  }

  async createTip(data: any): Promise<any> {
    return this.create(data);
  }
}
