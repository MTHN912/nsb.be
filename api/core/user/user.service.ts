import { Injectable, BadRequestException } from '@nestjs/common';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { HashUtil } from '../../shared/ultils/hash.util';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService extends CrudService<User> {
  constructor(protected prisma: PrismaService) {
    super(prisma, 'user');
  }

  async createUser(data: CreateUserDto, request?: any): Promise<User> {
    
    await this.checkEmailExists(data.email);
    const hashedPassword = await HashUtil.hash(data.password);
    
    const createData: any = {
      ...data,
      password: hashedPassword,
      role: { connect: { id: data.roleId } }
    };

    return this.create(
      createData,
      { include: { role: true } },
      request,
    );
  }

  async checkEmailExists(email: string): Promise<void> {
    const user = await this.findOne(
      { email },
      { include: { role: true, dealer: true }, throwNotFound: false },
    );

    if (user) {
      throw new BadRequestException('EMAIL_ALREADY_EXISTS');
    }
  }

  async findByEmail(email: string): Promise<User> {
    return await this.findOne(
      { email },
      { include: { role: true, dealer: true}, throwNotFound: false},
    );
  }

  async updateUserLastLogin(userId: number): Promise<User> {
    return this.prismaClient.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
