import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

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
  ) {}

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
    const data = await this.prismaClient.findMany({
      where: this.buildWhere(params.where, request),
      orderBy: params.orderBy,
      skip: params.skip,
      take: params.take,
      include: params.include,
      select: params.select,
    });

    return { data, total: data.length };
  }

  public async findOne(
    where: any,
    params: FindOneParams = {},
    request?: Request,
  ): Promise<T | null> {
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

    return this.prismaClient.create({
      data: cleanData,
      include: params.include,
    });
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

    return this.prismaClient.update({
      where: { id },
      data,
      include: params.include,
    });
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

    return this.prismaClient.delete({
      where: { id },
    });
  }

  protected async count(
    params: {
      where?: any;
    } = {},
    request?: Request,
  ): Promise<number> {
    return this.prismaClient.count({
      where: this.buildWhere(params.where, request),
    });
  }
}