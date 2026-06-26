import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoleService extends CrudService<Role> {
  constructor(
    protected prisma: PrismaService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    protected configService: ConfigService,
  ) {
    super(prisma, 'role', redisService, logger, configService);
  }
}
