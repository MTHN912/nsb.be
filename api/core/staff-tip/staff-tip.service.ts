import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StaffTipService extends CrudService<any> {
  constructor(
    protected prisma: PrismaService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    protected configService: ConfigService,
  ) {
    super(prisma, 'staffTip', redisService, logger, configService);
  }

  async createTip(data: any): Promise<any> {
    return this.create(data);
  }
}
