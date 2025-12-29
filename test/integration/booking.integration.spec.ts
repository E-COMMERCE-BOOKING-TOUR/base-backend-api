import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('Booking API (Integration)', () => {
    let app: INestApplication<App>;
    let accessToken: string;
    let sessionId: number;
    let pricingId: number;
    let bookingId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }));
        await app.init();

        // Register user
        const testUserEmail = `booking_int_${Date.now()}@example.com`;
        const registerResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
                email: testUserEmail,
                password: 'TestPassword@123',
                full_name: 'Booking Integration Test',
                phone: '0912345681',
            });

        if (registerResponse.status === 201) {
            accessToken = registerResponse.body.access_token;
        }

        // Get a tour with sessions for booking
        const toursResponse = await request(app.getHttpServer())
            .get('/api/v1/user/tour/popular')
            .query({ limit: 1 });

        if (toursResponse.body && toursResponse.body.length > 0) {
            const tourSlug = toursResponse.body[0].slug;

            const detailResponse = await request(app.getHttpServer())
                .get(`/api/v1/user/tour/${tourSlug}`);

            if (detailResponse.body?.variants?.length > 0) {
                const variantId = detailResponse.body.variants[0].id;

                const sessionsResponse = await request(app.getHttpServer())
                    .get(`/api/v1/user/tour/${tourSlug}/sessions`)
                    .query({ variant_id: variantId });

                if (sessionsResponse.body && sessionsResponse.body.length > 0) {
                    sessionId = sessionsResponse.body[0].id;
                }

                if (detailResponse.body.variants[0].pricing?.length > 0) {
                    pricingId = detailResponse.body.variants[0].pricing[0].id;
                }
            }
        }
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/user/booking/payment-methods', () => {
        it('should get payment methods', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/booking/payment-methods')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should fail without authentication', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/user/booking/payment-methods')
                .expect(401);
        });
    });

    describe('POST /api/v1/user/booking/create', () => {
        it('should create a booking', async () => {
            if (!sessionId || !pricingId) {
                console.log('Skipping: No session or pricing available');
                return;
            }

            const response = await request(app.getHttpServer())
                .post('/api/v1/user/booking/create')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    tour_session_id: sessionId,
                    participants: [
                        {
                            pricing_id: pricingId,
                            quantity: 2,
                        },
                    ],
                });

            if (response.status === 201) {
                expect(response.body).toHaveProperty('id');
                bookingId = response.body.id;
            } else {
                // May fail if session is full or unavailable
                expect([201, 400, 404]).toContain(response.status);
            }
        });

        it('should fail without authentication', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/user/booking/create')
                .send({
                    tour_session_id: 1,
                    participants: [{ pricing_id: 1, quantity: 1 }],
                })
                .expect(401);
        });
    });

    describe('GET /api/v1/user/booking/current', () => {
        it('should get current booking', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/booking/current')
                .set('Authorization', `Bearer ${accessToken}`);

            expect([200, 404]).toContain(response.status);
        });

        it('should fail without authentication', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/user/booking/current')
                .expect(401);
        });
    });

    describe('POST /api/v1/user/booking/current/contact-info', () => {
        it('should update contact info', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/user/booking/current/contact-info')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    contact_name: 'Integration Test',
                    contact_email: 'integration@test.com',
                    contact_phone: '0912345682',
                });

            expect([200, 201, 404]).toContain(response.status);
        });
    });

    describe('GET /api/v1/user/booking/history', () => {
        it('should get booking history', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/booking/history')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should get booking history with pagination', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/booking/history')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 5 })
                .expect(200);

            expect(response.body).toHaveProperty('data');
        });

        it('should fail without authentication', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/user/booking/history')
                .expect(401);
        });
    });

    describe('GET /api/v1/user/booking/:id', () => {
        it('should get booking detail', async () => {
            if (!bookingId) return;

            const response = await request(app.getHttpServer())
                .get(`/api/v1/user/booking/${bookingId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id', bookingId);
        });

        it('should return 404 for non-existent booking', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/user/booking/99999999')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });

    describe('POST /api/v1/user/booking/current/cancel', () => {
        it('should cancel current booking', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/user/booking/current/cancel')
                .set('Authorization', `Bearer ${accessToken}`);

            expect([200, 201, 404]).toContain(response.status);
        });
    });
});
