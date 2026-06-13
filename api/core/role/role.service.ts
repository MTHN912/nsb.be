import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService extends CrudService<Role> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'role');
  }
}
