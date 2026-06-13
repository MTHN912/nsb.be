import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleService } from '../role/role.service';

@Module({
  controllers: [UserController],
  providers: [UserService, RoleService],
  exports: [UserService],
})
export class UserModule {}
