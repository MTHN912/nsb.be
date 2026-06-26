import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

type QueryParams = {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  include?: any;
  select?: any;
};

type FindOneParams = {
  include?: any;
  select?: any;
  throwNotFound?: boolean;
};

@Injectable()
export class CrudService<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
    protected readonly redisService: RedisService,
    protected readonly logger: LoggerService,
    protected readonly configService: ConfigService,
  ) {
    this.logger.setContext(`CrudService:${this.modelName}`);
  }

  protected get prismaClient(): any {
    return (this.prisma as any)[this.modelName];
  }

  private readonly modelsWithDealer = ['user', 'customer'];

  private hasDealerField(): boolean {
    return this.modelsWithDealer.includes(
      this.modelName.toLowerCase(),
    );
  }

  protected getDealerId(request?: Request): number | null {
    const value = request?.headers['x-dealer-id'];

    if (!value) {
      return null;
    }

    const dealerId = Number(value);

    return Number.isNaN(dealerId) ? null : dealerId;
  }

  private generateCacheKey(method: string, params: any, request?: Request): string {
    const dealerId = this.getDealerId(request);
    const paramsString = JSON.stringify(params);
    const hash = createHash('md5').update(paramsString).digest('hex');
    return `${this.modelName}:${method}:${dealerId || 'global'}:${hash}`;
  }

  protected buildWhere(
    where: any = {},
    request?: Request,
  ): any {
    const dealerId = this.getDealerId(request);

    if (dealerId && this.hasDealerField()) {
      return {
        ...where,
        dealerId,
      };
    }

    return where;
  }

  protected async findAll(
    params: QueryParams = {},
    request?: Request,
  ): Promise<{ data: T[]; total: number }> {
    const cacheKey = this.generateCacheKey('findAll', params, request);
    const cacheTtl = parseInt(this.configService.get('CACHE_TTL') || '3600');

    try {
      const result = await this.redisService.getOrSet<{ data: T[]; total: number }>(
        cacheKey,
        async () => {
          const [data, total] = await Promise.all([
            this.prismaClient.findMany({
              where: this.buildWhere(params.where, request),
              orderBy: params.orderBy,
              skip: params.skip,
              take: params.take,
              include: params.include,
              select: params.select,
            }),
            this.prismaClient.count({
              where: this.buildWhere(params.where, request),
            }),
          ]);

          return { data, total };
        },
        cacheTtl,
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch or cache findAll data`, error.stack);
      // Fallback to DB if cache fails
      const [data, total] = await Promise.all([
        this.prismaClient.findMany({
          where: this.buildWhere(params.where, request),
          orderBy: params.orderBy,
          skip: params.skip,
          take: params.take,
          include: params.include,
          select: params.select,
        }),
        this.prismaClient.count({
          where: this.buildWhere(params.where, request),
        }),
      ]);

      return { data, total };
    }
  }

  public async findOne(
    where: any,
    params: FindOneParams = {},
    request?: Request,
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey('findOne', { where, params }, request);
    const cacheTtl = parseInt(this.configService.get('CACHE_TTL') || '3600');

    try {
      const record = await this.redisService.getOrSet<T | null>(
        cacheKey,
        async () => {
          const data = await this.prismaClient.findFirst({
            where: this.buildWhere(where, request),
            include: params.include,
            select: params.select,
          });

          if (!data && params.throwNotFound !== false) {
            throw new NotFoundException(
              `${this.modelName} not found`,
            );
          }

          return data;
        },
        cacheTtl,
      );

      return record;
    } catch (error) {
      this.logger.error(`Failed to fetch or cache findOne data`, error.stack);
      // Fallback to DB if cache fails
      const record = await this.prismaClient.findFirst({
        where: this.buildWhere(where, request),
        include: params.include,
        select: params.select,
      });

      if (!record && params.throwNotFound !== false) {
        throw new NotFoundException(
          `${this.modelName} not found`,
        );
      }

      return record;
    }
  }

  protected async create(
    data: any,
    params: {
      include?: any;
    } = {},
    request?: Request,
  ): Promise<T> {
    const dealerId = this.getDealerId(request);

    // Filter out relation ID fields to avoid conflicts
    const { roleId, dealerId: dataDealerId, ...cleanData } = data;

    // Add dealer relation if dealerId is provided
    if (dealerId && this.hasDealerField()) {
      cleanData.dealer = { connect: { id: dealerId } };
    }

    try {
      const result = await this.prismaClient.create({
        data: cleanData,
        include: params.include,
      });

      // Invalidate cache after create
      await this.invalidateCache(request);

      this.logger.log(`Created ${this.modelName} record`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create ${this.modelName} record`, error.stack);
      throw error;
    }
  }

  protected async update(
    id: number,
    data: any,
    params: FindOneParams = {},
    request?: Request,
  ): Promise<T> {
    await this.findOne(
      { id },
      {
        throwNotFound: params.throwNotFound,
      },
      request,
    );

    const dealerId = this.getDealerId(request);
    if (dealerId && this.hasDealerField()) {
      data.dealerId = dealerId;
    }

    try {
      const result = await this.prismaClient.update({
        where: { id },
        data,
        include: params.include,
      });

      // Invalidate cache after update
      await this.invalidateCache(request);

      this.logger.log(`Updated ${this.modelName} record with id: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update ${this.modelName} record with id: ${id}`, error.stack);
      throw error;
    }
  }

  protected async delete(
    id: number,
    params: {
      throwNotFound?: boolean;
    } = {},
    request?: Request,
  ): Promise<T> {
    await this.findOne(
      { id },
      {
        throwNotFound: params.throwNotFound,
      },
      request,
    );

    try {
      const result = await this.prismaClient.delete({
        where: { id },
      });

      // Invalidate cache after delete
      await this.invalidateCache(request);

      this.logger.log(`Deleted ${this.modelName} record with id: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete ${this.modelName} record with id: ${id}`, error.stack);
      throw error;
    }
  }

  protected async count(
    params: {
      where?: any;
    } = {},
    request?: Request,
  ): Promise<number> {
    try {
      return this.prismaClient.count({
        where: this.buildWhere(params.where, request),
      });
    } catch (error) {
      this.logger.error(`Failed to count ${this.modelName} records`, error.stack);
      throw error;
    }
  }

  private async invalidateCache(request?: Request): Promise<void> {
    try {
      const dealerId = this.getDealerId(request);
      const pattern = `${this.modelName}:${dealerId || 'global'}:*`;
      await this.redisService.invalidatePattern(pattern);
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for ${this.modelName}`, error.stack);
      // Don't throw error - cache invalidation failure shouldn't break the operation
    }
  }

  protected async clearCacheByDealerId(dealerId?: number | null): Promise<void> {
    try {
      const pattern = `${this.modelName}:${dealerId || 'global'}:*`;
      await this.redisService.invalidatePattern(pattern);
      this.logger.log(`Cleared cache for ${this.modelName} with dealerId: ${dealerId || 'global'}`);
    } catch (error) {
      this.logger.error(`Failed to clear cache for ${this.modelName} with dealerId: ${dealerId || 'global'}`, error.stack);
    }
  }
}