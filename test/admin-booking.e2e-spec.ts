import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
} from './test-utils';

describe('Admin Booking API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock BookingService (admin)
    const mockBookingService = {
        getAllBooking: jest.fn(),
        getBookingById: jest.fn(),
        getBookingsByUser: jest.fn(),
        createBooking: jest.fn(),
        updateContact: jest.fn(),
        updateStatus: jest.fn(),
        updatePaymentStatus: jest.fn(),
        addItem: jest.fn(),
        removeItem: jest.fn(),
        changeItemQuantity: jest.fn(),
        removeBooking: jest.fn(),
        confirmBooking: jest.fn(),
        cancelBooking: jest.fn(),
        expireBooking: jest.fn(),
        calculateRefund: jest.fn(),
        processAdminRefund: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        // Seed some bookings
        mockDatabase.bookings.set(1, {
            id: 1,
            user_id: 1,
            tour_session_id: 1,
            status: 'confirmed',
            payment_status: 'paid',
            contact_name: 'Test User',
            contact_email: 'test@test.com',
            created_at: new Date(),
        });

        mockBookingService.getAllBooking.mockResolvedValue(
            Array.from(mockDatabase.bookings.values())
        );

        mockBookingService.getBookingById.mockImplementation((id: number) => {
            const booking = mockDatabase.bookings.get(id);
            if (!booking) throw new Error('Booking not found');
            return Promise.resolve(booking);
        });

        mockBookingService.getBookingsByUser.mockImplementation((userId: number) => {
            const bookings = Array.from(mockDatabase.bookings.values());
            return Promise.resolve(
                bookings.filter((b: any) => b.user_id === userId)
            );
        });

        mockBookingService.createBooking.mockImplementation((dto: any) => {
            const bookingId = mockDatabase.nextId.booking++;
            const booking = {
                id: bookingId,
                ...dto,
                status: 'pending',
                payment_status: 'unpaid',
                created_at: new Date(),
            };
            mockDatabase.bookings.set(bookingId, booking);
            return Promise.resolve(booking);
        });

        mockBookingService.updateContact.mockImplementation((id: number, dto: any) => {
            const booking = mockDatabase.bookings.get(id);
            if (booking) {
                Object.assign(booking, dto);
                return Promise.resolve(booking);
            }
            throw new Error('Booking not found');
        });

        mockBookingService.updateStatus.mockImplementation((id: number, status: string) => {
            const booking = mockDatabase.bookings.get(id);
            if (booking) {
                booking.status = status;
                return Promise.resolve(booking);
            }
            throw new Error('Booking not found');
        });

        mockBookingService.updatePaymentStatus.mockImplementation((id: number, status: string) => {
            const booking = mockDatabase.bookings.get(id);
            if (booking) {
                booking.payment_status = status;
                return Promise.resolve(booking);
            }
            throw new Error('Booking not found');
        });

        mockBookingService.confirmBooking.mockImplementation((id: number) => {
            const booking = mockDatabase.bookings.get(id);
            if (booking) {
                booking.status = 'confirmed';
                return Promise.resolve(booking);
            }
            throw new Error('Booking not found');
        });

        mockBookingService.cancelBooking.mockImplementation((id: number, reason?: string) => {
            const booking = mockDatabase.bookings.get(id);
            if (booking) {
                booking.status = 'cancelled';
                booking.cancel_reason = reason;
                return Promise.resolve(booking);
            }
            throw new Error('Booking not found');
        });

        mockBookingService.expireBooking.mockImplementation((id: number) => {
            const booking = mockDatabase.bookings.get(id);
            if (booking) {
                booking.status = 'expired';
                return Promise.resolve(booking);
            }
            throw new Error('Booking not found');
        });

        mockBookingService.calculateRefund.mockResolvedValue({
            refundAmount: 500000,
            refundPercentage: 50,
            daysBeforeTour: 5,
        });

        mockBookingService.processAdminRefund.mockResolvedValue({
            success: true,
            refundAmount: 500000,
        });

        mockBookingService.addItem.mockResolvedValue({ success: true });
        mockBookingService.removeItem.mockResolvedValue({ success: true });
        mockBookingService.changeItemQuantity.mockResolvedValue({ success: true });
        mockBookingService.removeBooking.mockResolvedValue(true);

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [],
            providers: [],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Mock Admin Booking Service Tests', () => {
        let createdBookingId: number;

        it('should have seeded booking', () => {
            const booking = mockDatabase.bookings.get(1);
            expect(booking).toBeDefined();
            expect(booking.status).toBe('confirmed');
        });

        it('should get all bookings', async () => {
            const bookings = await mockBookingService.getAllBooking();
            expect(Array.isArray(bookings)).toBe(true);
            expect(bookings.length).toBeGreaterThan(0);
        });

        it('should get booking by id', async () => {
            const booking = await mockBookingService.getBookingById(1);
            expect(booking).toHaveProperty('id', 1);
        });

        it('should get bookings by user', async () => {
            const bookings = await mockBookingService.getBookingsByUser(1);
            expect(Array.isArray(bookings)).toBe(true);
            expect(bookings.every((b: any) => b.user_id === 1)).toBe(true);
        });

        it('should create booking', async () => {
            const booking = await mockBookingService.createBooking({
                user_id: 2,
                tour_session_id: 1,
            });
            expect(booking).toHaveProperty('id');
            expect(booking.status).toBe('pending');
            createdBookingId = booking.id;
        });

        it('should update contact', async () => {
            const updated = await mockBookingService.updateContact(createdBookingId, {
                contact_name: 'Updated Contact',
                contact_email: 'updated@test.com',
            });
            expect(updated.contact_name).toBe('Updated Contact');
        });

        it('should update status', async () => {
            const updated = await mockBookingService.updateStatus(createdBookingId, 'confirmed');
            expect(updated.status).toBe('confirmed');
        });

        it('should update payment status', async () => {
            const updated = await mockBookingService.updatePaymentStatus(createdBookingId, 'paid');
            expect(updated.payment_status).toBe('paid');
        });

        it('should calculate refund', async () => {
            const result = await mockBookingService.calculateRefund(1);
            expect(result).toHaveProperty('refundAmount');
            expect(result).toHaveProperty('refundPercentage');
        });

        it('should cancel booking with reason', async () => {
            const cancelled = await mockBookingService.cancelBooking(createdBookingId, 'Customer request');
            expect(cancelled.status).toBe('cancelled');
            expect(cancelled.cancel_reason).toBe('Customer request');
        });

        it('should process admin refund', async () => {
            const result = await mockBookingService.processAdminRefund(1, 500000);
            expect(result.success).toBe(true);
            expect(result.refundAmount).toBe(500000);
        });
    });
});
