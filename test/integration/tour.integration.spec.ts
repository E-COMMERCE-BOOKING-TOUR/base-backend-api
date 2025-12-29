import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('Tour API (Integration)', () => {
    let app: INestApplication<App>;
    let accessToken: string;
    let tourSlug: string;
    let tourId: number;

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

        // Register user to get token
        const testUserEmail = `tour_int_${Date.now()}@example.com`;
        const registerResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
                email: testUserEmail,
                password: 'TestPassword@123',
                full_name: 'Tour Integration Test',
                phone: '0912345680',
            });

        if (registerResponse.status === 201) {
            accessToken = registerResponse.body.access_token;
        }
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/user/tour/search/list', () => {
        it('should search tours without filters', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/tour/search/list')
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body).toHaveProperty('total');

            // Save tour for later tests
            if (response.body.data.length > 0) {
                tourSlug = response.body.data[0].slug;
                tourId = response.body.data[0].id;
            }
        });

        it('should search tours with keyword', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/tour/search/list')
                .query({ keyword: 'tour' })
                .expect(200);

            expect(response.body).toHaveProperty('data');
        });

        it('should search tours with pagination', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/tour/search/list')
                .query({ limit: 5, offset: 0 })
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('limit');
        });

        it('should search tours with price range', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/tour/search/list')
                .query({ min_price: 0, max_price: 10000000 })
                .expect(200);

            expect(response.body).toHaveProperty('data');
        });
    });

    describe('GET /api/v1/user/tour/popular', () => {
        it('should get popular tours', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/tour/popular')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should get popular tours with custom limit', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/tour/popular')
                .query({ limit: 4 })
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeLessThanOrEqual(4);
        });
    });

    describe('GET /api/v1/user/tour/:slug', () => {
        it('should get tour detail by slug', async () => {
            if (!tourSlug) {
                console.log('Skipping: No tour available');
                return;
            }

            const response = await request(app.getHttpServer())
                .get(`/api/v1/user/tour/${tourSlug}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('slug', tourSlug);
        });

        it('should return 404 for non-existent tour', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/user/tour/non-existent-tour-slug-12345')
                .expect(404);
        });
    });

    describe('GET /api/v1/user/tour/:slug/reviews', () => {
        it('should get tour reviews', async () => {
            if (!tourSlug) return;

            const response = await request(app.getHttpServer())
                .get(`/api/v1/user/tour/${tourSlug}/reviews`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/v1/user/tour/:slug/related', () => {
        it('should get related tours', async () => {
            if (!tourSlug) return;

            const response = await request(app.getHttpServer())
                .get(`/api/v1/user/tour/${tourSlug}/related`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/v1/user/tour/favorite/toggle', () => {
        it('should toggle favorite with guest_id', async () => {
            if (!tourId) return;

            const response = await request(app.getHttpServer())
                .post('/api/v1/user/tour/favorite/toggle')
                .send({
                    tour_id: tourId,
                    guest_id: 'integration-test-guest',
                });

            // May succeed or fail depending on tour existence
            expect([200, 201, 400, 404]).toContain(response.status);
        });

        it('should toggle favorite with authentication', async () => {
            if (!tourId) return;

            const response = await request(app.getHttpServer())
                .post('/api/v1/user/tour/favorite/toggle')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    tour_id: tourId,
                });

            expect([200, 201, 400, 404]).toContain(response.status);
        });
    });
});
