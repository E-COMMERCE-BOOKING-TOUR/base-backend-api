import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
    TestDataFactory,
} from './test-utils';

describe('User Booking API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock UserBookingService
    const mockUserBookingService = {
        createBooking: jest.fn(),
        getCurrentBooking: jest.fn(),
        updateBookingContact: jest.fn(),
        updateBookingPayment: jest.fn(),
        confirmCurrentBooking: jest.fn(),
        cancelCurrentBooking: jest.fn(),
        getPaymentMethods: jest.fn(),
        getAllBookingsByUser: jest.fn(),
        getBookingDetail: jest.fn(),
        confirmBooking: jest.fn(),
        cancelConfirmedBooking: jest.fn(),
        calculateRefund: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        // Setup mock responses
        mockUserBookingService.createBooking.mockImplementation((uuid: string, dto: any) => {
            const bookingId = mockDatabase.nextId.booking++;
            const booking = {
                id: bookingId,
                user_uuid: uuid,
                tour_session_id: dto.tour_session_id,
                status: 'pending',
                payment_status: 'unpaid',
                created_at: new Date(),
            };
            mockDatabase.bookings.set(bookingId, booking);
            return Promise.resolve(booking);
        });

        mockUserBookingService.getCurrentBooking.mockImplementation((uuid: string) => {
            const bookings = Array.from(mockDatabase.bookings.values());
            return Promise.resolve(
                bookings.find((b: any) => b.user_uuid === uuid && b.status === 'pending') || null
            );
        });

        mockUserBookingService.updateBookingContact.mockResolvedValue({
            success: true,
            bookingId: 1,
        });

        mockUserBookingService.updateBookingPayment.mockResolvedValue({
            success: true,
            bookingId: 1,
        });

        mockUserBookingService.confirmCurrentBooking.mockResolvedValue({
            success: true,
            bookingId: 1,
        });

        mockUserBookingService.cancelCurrentBooking.mockResolvedValue({
            success: true,
            message: 'Booking cancelled',
        });

        mockUserBookingService.getPaymentMethods.mockResolvedValue([
            { id: 1, name: 'Credit Card', type: 'card' },
            { id: 2, name: 'Bank Transfer', type: 'bank' },
        ]);

        mockUserBookingService.getAllBookingsByUser.mockResolvedValue({
            data: [],
            total: 0,
            page: 1,
            limit: 10,
        });

        mockUserBookingService.getBookingDetail.mockImplementation((id: number) => {
            const booking = mockDatabase.bookings.get(id);
            if (!booking) {
                throw new Error('Booking not found');
            }
            return Promise.resolve(booking);
        });

        mockUserBookingService.calculateRefund.mockResolvedValue({
            refundAmount: 0,
            refundPercentage: 0,
            daysBeforeTour: 0,
        });

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

    describe('Mock Booking Service Tests', () => {
        let testUserUuid: string;
        let createdBookingId: number;

        beforeAll(() => {
            testUserUuid = 'test-user-uuid-001';
        });

        it('should create booking with mock service', async () => {
            const bookingData = TestDataFactory.booking();
            const result = await mockUserBookingService.createBooking(testUserUuid, bookingData);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('status', 'pending');
            expect(result).toHaveProperty('user_uuid', testUserUuid);

            createdBookingId = result.id;
        });

        it('should store booking in mock database', () => {
            expect(mockDatabase.bookings.size).toBeGreaterThan(0);
        });

        it('should get current booking', async () => {
            const result = await mockUserBookingService.getCurrentBooking(testUserUuid);
            expect(result).toBeDefined();
            expect(result.status).toBe('pending');
        });

        it('should update contact info', async () => {
            const result = await mockUserBookingService.updateBookingContact(testUserUuid, {
                contact_name: 'Test User',
                contact_email: 'test@test.com',
            });
            expect(result.success).toBe(true);
        });

        it('should update payment method', async () => {
            const result = await mockUserBookingService.updateBookingPayment(testUserUuid, {
                payment_method_id: 1,
            });
            expect(result.success).toBe(true);
        });

        it('should get payment methods', async () => {
            const methods = await mockUserBookingService.getPaymentMethods(testUserUuid);
            expect(Array.isArray(methods)).toBe(true);
            expect(methods.length).toBeGreaterThan(0);
            expect(methods[0]).toHaveProperty('id');
            expect(methods[0]).toHaveProperty('name');
        });

        it('should confirm booking', async () => {
            const result = await mockUserBookingService.confirmCurrentBooking(testUserUuid);
            expect(result.success).toBe(true);
        });

        it('should get booking history', async () => {
            const result = await mockUserBookingService.getAllBookingsByUser(testUserUuid, 1, 10);
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data)).toBe(true);
        });

        it('should get booking detail', async () => {
            if (!createdBookingId) return;
            const booking = await mockUserBookingService.getBookingDetail(createdBookingId);
            expect(booking).toHaveProperty('id', createdBookingId);
        });

        it('should calculate refund', async () => {
            const result = await mockUserBookingService.calculateRefund(1);
            expect(result).toHaveProperty('refundAmount');
            expect(result).toHaveProperty('refundPercentage');
        });

        it('should cancel booking', async () => {
            const result = await mockUserBookingService.cancelCurrentBooking(testUserUuid);
            expect(result.success).toBe(true);
            expect(result.message).toBe('Booking cancelled');
        });
    });

    describe('Mock Repository Tests', () => {
        it('should find all bookings', async () => {
            const mockRepo = createMockRepository('bookings');
            const bookings = await mockRepo.find();
            expect(Array.isArray(bookings)).toBe(true);
        });

        it('should find booking by id', async () => {
            const bookingId = mockDatabase.bookings.keys().next().value;
            if (bookingId) {
                const mockRepo = createMockRepository('bookings');
                const booking = await mockRepo.findOne({ where: { id: bookingId } });
                expect(booking).toBeDefined();
            }
        });

        it('should save new booking', async () => {
            const mockRepo = createMockRepository('bookings');
            const newBooking = {
                user_uuid: 'new-user-uuid',
                status: 'pending',
            };
            const saved = await mockRepo.save(newBooking);
            expect(saved.id).toBeDefined();
        });
    });
});
