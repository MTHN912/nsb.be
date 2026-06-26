import { Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PackageService extends CrudService<any> {
  constructor(
    protected prisma: PrismaService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    protected configService: ConfigService,
  ) {
    super(prisma, 'package', redisService, logger, configService);
  }

  async createPackage(data: any, request?: any): Promise<any> {
    return this.create(data, {}, request);
  }

  async getAllPackages(searchDto: any, request?: any): Promise<{ data: any[]; total: number }> {
    return this.findAll(
      {
        where: searchDto?.where,
        orderBy: searchDto?.orderBy,
        skip: searchDto?.skip,
        take: searchDto?.take,
        include: {
          packageServices: {
            include: {
              service: true,
            },
          },
        },
      },
      request,
    );
  }

  async getPackageById(id: number): Promise<any> {
    const pkg = await this.findOne(
      { id },
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

    return pkg;
  }
}
