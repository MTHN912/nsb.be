import { Injectable } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_CURRENCY } from '../../shared/constants/role.constants';
import { StaffCommissionService } from '../staff-commission/staff-commission.service';
import { StaffTipService } from '../staff-tip/staff-tip.service';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StaffIncomeService extends CrudService<any> {
  constructor(
    protected prisma: PrismaService,
    private readonly staffCommissionService: StaffCommissionService,
    private readonly staffTipService: StaffTipService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    protected configService: ConfigService,
  ) {
    super(prisma, 'staffIncome', redisService, logger, configService);
  }

  async createIncome(data: {
    userId: number;
    inComeDate: Date | string;
    serviceIncome?: number;
    tipsIncome?: number;
    serviceId?: number | number[];
  }, request?: any): Promise<any> {
    const { userId, inComeDate, serviceIncome, tipsIncome, serviceId } = data;

    const incomeDate = typeof inComeDate === 'string' ? new Date(inComeDate) : inComeDate;

    let staffComissonId: number | null = null;
    let staffTipsId: number | null = null;

    if (serviceIncome && serviceIncome > 0) {
      const commission = await this.staffCommissionService.createCommission({
        userId,
        amount: serviceIncome,
        currency: DEFAULT_CURRENCY,
        period: incomeDate.toISOString().split('T')[0],
      }, request);
      staffComissonId = commission.id;
    }

    if (tipsIncome && tipsIncome > 0) {
      const tip = await this.staffTipService.createTip({
        userId,
        amount: tipsIncome,
        currency: DEFAULT_CURRENCY,
        receivedAt: incomeDate,
      }, request);
      staffTipsId = tip.id;
    }

    const serviceIds = Array.isArray(serviceId) ? serviceId : (serviceId ? [serviceId] : []);

    const staffIncome = await this.createIncomeRecord({
      userId,
      inComeDate: incomeDate,
      staffComissonId,
      staffTipsId,
    });

    if (serviceIds.length > 0) {
      await Promise.all(
        serviceIds.map((id) =>
          (this.prisma as any).staffIncomeService.create({
            data: {
              staffIncomeId: staffIncome.id,
              serviceId: id,
            },
          }),
        ),
      );
    }

    return this.findOne(
      { id: staffIncome.id },
      {
        include: {
          user: true,
          staffCommission: true,
          staffTip: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      },
    );
  }

  async createIncomeRecord(data: any): Promise<any> {
    return this.create(data);
  }

  async searchIncome(searchDto: any, request?: any): Promise<{ data: any[]; total: number }> {
    return this.findAll(
      {
        where: searchDto?.where,
        orderBy: searchDto?.orderBy,
        skip: searchDto?.skip,
        take: searchDto?.take,
        include: {
          user: true,
          staffCommission: true,
          staffTip: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      },
      request,
    );
  }
}
