import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { HashUtil } from '../../shared/ultils/hash.util';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { RoleService } from '../role/role.service';
import { ROLE_NAMES } from '../../shared/constants/role.constants';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(
    protected prisma: PrismaService,
    private readonly roleService: RoleService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    protected configService: ConfigService,
  ) {
    super(prisma, 'user', redisService, logger, configService);
  }

  async createUser(data: CreateUserDto, request?: any): Promise<User> {

    await this.checkEmailExists(data.email);
    const hashedPassword = await HashUtil.hash(data.password);

    const createData: any = {
      ...data,
      password: hashedPassword,
    };

    const user = await this.create(
      createData,
      { include: { roles: { include: { role: true } } } },
      request,
    );

    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: data.roleId,
      },
    });

    return this.findOne(
      { id: user.id },
      { include: { roles: { include: { role: true } } } },
      request,
    );
  }

  async checkEmailExists(email: string): Promise<void> {
    const user = await this.findOne(
      { email },
      { include: { roles: { include: { role: true } }, dealer: true }, throwNotFound: false },
    );

    if (user) {
      throw new BadRequestException('EMAIL_ALREADY_EXISTS');
    }
  }

  async findByEmail(email: string): Promise<User> {
    return await this.findOne(
      { email },
      { include: { roles: { include: { role: true } }, dealer: true}, throwNotFound: false},
    );
  }

  async updateUserLastLogin(userId: number): Promise<User> {
    return this.prismaClient.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async findAllUsers(searchUserDto: any, request?: any): Promise<{ data: User[]; total: number }> {
    return this.findAll(
      {
        where: searchUserDto?.where,
        orderBy: searchUserDto?.orderBy,
        skip: searchUserDto?.skip,
        take: searchUserDto?.take,
        include: searchUserDto?.include || { roles: { include: { role: true } }, dealer: true },
        select: searchUserDto?.select,
      },
      request,
    );
  }

  async createStaff(data: CreateStaffDto, request?: any): Promise<User> {
    const staffRole = await this.roleService.findOne(
      { code: ROLE_NAMES.STAFF },
      { throwNotFound: false },
    );

    if (!staffRole) {
      throw new NotFoundException('ROLE.STAFF_NOT_FOUND');
    }

    const createData: any = {
      ...data,
    };

    const user = await this.create(
      createData,
      { include: { roles: { include: { role: true } } } },
      request,
    );

    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: staffRole.id,
      },
    });

    return this.findOne(
      { id: user.id },
      { include: { roles: { include: { role: true } }, dealer: true } },
      request,
    );
  }

  async getProfile(userId: number, request?: any): Promise<User> {
    return this.findOne(
      { id: userId },
      { include: { roles: { include: { role: true } }, dealer: true } },
      request,
    );
  }
}
