import { Controller, Post, Body, Get, Query, Req, UseGuards, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.userService.createUser(createUserDto, req);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.id, req);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.userService.findOne(parseInt(id), { include: { roles: { include: { role: true } }, dealer: true } }, req);
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  async findAll(@Body() searchUserDto: any, @Req() req: any) {
    return this.userService.findAllUsers(searchUserDto, req);
  }

  @Post('staff')
  @UseGuards(JwtAuthGuard)
  async createStaff(@Body() createStaffDto: CreateStaffDto, @Req() req: any) {
    return this.userService.createStaff(createStaffDto, req);
  }
}
