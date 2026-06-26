import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StaffCommissionService extends CrudService<any> {
  constructor(
    protected prisma: PrismaService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    protected configService: ConfigService,
  ) {
    super(prisma, 'staffCommission', redisService, logger, configService);
  }

  async createCommission(data: any): Promise<any> {
    return this.create(data);
  }
}
