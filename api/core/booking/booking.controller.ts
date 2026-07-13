import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateGuestBookingDto } from './dto/create-guest-booking.dto';
import { CreateAdminBookingDto } from './dto/create-admin-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingType } from '../../shared/constants/booking.constants';

@ApiTags('bookings')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking for an existing customer account' })
  async create(@Body() dto: CreateBookingDto, @Req() req: any) {
    return this.bookingService.createBooking(dto, BookingType.CUSTOMER, req);
  }

  @Post('guest')
  @ApiOperation({ summary: 'Create a booking for a guest (no account)' })
  async createGuest(@Body() dto: CreateGuestBookingDto, @Req() req: any) {
    return this.bookingService.createBooking(dto, BookingType.GUEST, req);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a booking on behalf of a customer (admin)' })
  async createByAdmin(@Body() dto: CreateAdminBookingDto, @Req() req: any) {
    return this.bookingService.createBooking(dto, BookingType.ADMIN, req);
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search bookings' })
  async search(@Body() searchDto: any, @Req() req: any) {
    return this.bookingService.searchBookings(searchDto, req);
  }
}
