import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CrudService } from './crud.service';

@Module({
  imports: [PrismaModule],
  providers: [CrudService],
  exports: [CrudService],
})
export class CrudModule {}