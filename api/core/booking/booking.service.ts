import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import { HashUtil } from '../../shared/ultils/hash.util';
import {
  BOOKING_STATUS,
  BookingType,
} from '../../shared/constants/booking.constants';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateGuestBookingDto } from './dto/create-guest-booking.dto';
import { CreateAdminBookingDto } from './dto/create-admin-booking.dto';
import { CustomerDetailsDto } from './dto/customer-details.dto';

type CreateBookingInput =
  | CreateBookingDto
  | CreateGuestBookingDto
  | CreateAdminBookingDto;

@Injectable()
export class BookingService extends CrudService<any> {
  // Public-facing customer fields (password is intentionally excluded).
  private readonly customerSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    state: true,
    zipCode: true,
    phoneNumber: true,
    contactEmail: true,
    dateOfBirth: true,
    gender: true,
    notes: true,
    isActive: true,
    dealerId: true,
    createdAt: true,
    updatedAt: true,
  };

  // Public-facing staff fields (password is intentionally excluded).
  private readonly staffSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    avatar: true,
    phoneNumber: true,
    isActive: true,
    dealerId: true,
  };

  private readonly bookingInclude = {
    customer: { select: this.customerSelect },
    staff: { select: this.staffSelect },
    services: { include: { service: true } },
  };

  constructor(
    protected prisma: PrismaService,
    protected redisService: RedisService,
    protected logger: LoggerService,
    protected configService: ConfigService,
  ) {
    super(prisma, 'booking', redisService, logger, configService);
  }

  /**
   * Single shared booking flow used by the customer, guest and admin
   * endpoints. The behaviour only differs through the `type` condition
   * variable, which controls how the customer (Step 5 - Personal Details)
   * is resolved. Steps 1-4 are identical for every booking type.
   */
  async createBooking(
    dto: CreateBookingInput,
    type: BookingType,
    request?: any,
  ): Promise<any> {
    // Step 5 - Personal Details: resolve the customer for this booking.
    const customer = await this.resolveCustomer(dto, type, request);

    // Step 1 - Select Your Ritual: validate the selected services.
    await this.validateServices(dto.serviceIds);

    // Step 2 - Choose Your Artist: validate the selected staff (optional).
    if (dto.staffId) {
      await this.validateStaff(dto.staffId);
    }

    // Step 3 & 4 - Select Date and Choose Time Slot.
    const bookingDate = this.parseBookingDate(dto.bookingDate);

    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          customerId: customer.id,
          staffId: dto.staffId ?? null,
          bookingDate,
          status: BOOKING_STATUS.PENDING,
          source: type,
          notes: dto.notes,
        },
      });

      await tx.bookingService.createMany({
        data: dto.serviceIds.map((serviceId) => ({
          bookingId: created.id,
          serviceId,
        })),
      });

      return created;
    });

    await this.invalidateCache(request);

    return this.findOne(
      { id: booking.id },
      { include: this.bookingInclude },
      request,
    );
  }

  async searchBookings(
    searchDto: any,
    request?: any,
  ): Promise<{ data: any[]; total: number }> {
    return this.findAll(
      {
        where: searchDto?.where,
        orderBy: searchDto?.orderBy,
        skip: searchDto?.skip,
        take: searchDto?.take,
        include: searchDto?.include || this.bookingInclude,
      },
      request,
    );
  }

  private async resolveCustomer(
    dto: CreateBookingInput,
    type: BookingType,
    request?: any,
  ): Promise<Customer> {
    switch (type) {
      case BookingType.CUSTOMER:
        return this.findCustomerById((dto as CreateBookingDto).customerId);

      case BookingType.GUEST:
        return this.findOrCreateCustomer(
          (dto as CreateGuestBookingDto).customer,
          request,
        );

      case BookingType.ADMIN: {
        const adminDto = dto as CreateAdminBookingDto;
        if (adminDto.customerId) {
          return this.findCustomerById(adminDto.customerId);
        }
        if (adminDto.customer) {
          return this.findOrCreateCustomer(adminDto.customer, request);
        }
        throw new BadRequestException('BOOKING.CUSTOMER_INFO_REQUIRED');
      }

      default:
        throw new BadRequestException('BOOKING.INVALID_TYPE');
    }
  }

  private async findCustomerById(customerId: number): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('BOOKING.CUSTOMER_NOT_FOUND');
    }

    return customer;
  }

  private async findOrCreateCustomer(
    details: CustomerDetailsDto,
    request?: any,
  ): Promise<Customer> {
    const existing = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email: details.email }, { phoneNumber: details.phoneNumber }],
      },
    });

    if (existing) {
      return existing;
    }

    const dealerId = details.dealerId ?? this.getDealerId(request);
    if (!dealerId) {
      throw new BadRequestException('BOOKING.DEALER_REQUIRED');
    }

    // Guests do not choose a password; create a non-guessable placeholder so
    // the account can be claimed later without exposing a usable credential.
    const password = await HashUtil.hash(uuidv4());

    return this.prisma.customer.create({
      data: {
        email: details.email,
        password,
        firstName: details.firstName,
        lastName: details.lastName,
        phoneNumber: details.phoneNumber,
        addressLine1: details.addressLine1,
        addressLine2: details.addressLine2,
        city: details.city,
        state: details.state,
        zipCode: details.zipCode,
        dateOfBirth: details.dateOfBirth
          ? new Date(details.dateOfBirth)
          : null,
        gender: details.gender,
        dealerId,
      },
    });
  }

  private async validateServices(serviceIds: number[]): Promise<void> {
    const uniqueIds = [...new Set(serviceIds)];

    const count = await this.prisma.service.count({
      where: { id: { in: uniqueIds }, isActive: true },
    });

    if (count !== uniqueIds.length) {
      throw new NotFoundException('BOOKING.SERVICE_NOT_FOUND');
    }
  }

  private async validateStaff(staffId: number): Promise<void> {
    const staff = await this.prisma.user.findFirst({
      where: { id: staffId, isActive: true },
    });

    if (!staff) {
      throw new NotFoundException('BOOKING.STAFF_NOT_FOUND');
    }
  }

  private parseBookingDate(value: string): Date {
    const bookingDate = new Date(value);

    if (Number.isNaN(bookingDate.getTime())) {
      throw new BadRequestException('BOOKING.INVALID_DATE');
    }

    if (bookingDate.getTime() < Date.now()) {
      throw new BadRequestException('BOOKING.DATE_IN_PAST');
    }

    return bookingDate;
  }
}
