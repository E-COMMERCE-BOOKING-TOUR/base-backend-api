import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('Auth API (Integration)', () => {
    let app: INestApplication<App>;
    const testUserEmail = `test_${Date.now()}@example.com`;
    const testUserPassword = 'TestPassword@123';
    let accessToken: string;
    let refreshToken: string;
    let userId: number;

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
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: testUserEmail,
                    password: testUserPassword,
                    full_name: 'Integration Test User',
                    phone: '0912345678',
                })
                .expect(201);

            expect(response.body).toHaveProperty('access_token');
            expect(response.body).toHaveProperty('refresh_token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUserEmail);

            accessToken = response.body.access_token;
            refreshToken = response.body.refresh_token;
            userId = response.body.user.id;
        });

        it('should fail to register with existing email', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: testUserEmail,
                    password: testUserPassword,
                    full_name: 'Another User',
                    phone: '0987654321',
                })
                .expect(400);

            expect(response.body).toHaveProperty('message');
        });

        it('should fail to register with invalid email', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: testUserPassword,
                    full_name: 'Test User',
                })
                .expect(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login with correct credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUserEmail,
                    password: testUserPassword,
                })
                .expect(201);

            expect(response.body).toHaveProperty('access_token');
            expect(response.body).toHaveProperty('refresh_token');

            accessToken = response.body.access_token;
            refreshToken = response.body.refresh_token;
        });

        it('should fail with wrong password', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUserEmail,
                    password: 'WrongPassword@123',
                })
                .expect(401);
        });

        it('should fail with non-existent email', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUserPassword,
                })
                .expect(401);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('should get current user with valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id', userId);
            expect(response.body).toHaveProperty('email', testUserEmail);
        });

        it('should fail without token', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .expect(401);
        });

        it('should fail with invalid token', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        it('should refresh token with valid refresh token', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/refresh')
                .set('Authorization', `Bearer ${refreshToken}`)
                .expect(201);

            expect(response.body).toHaveProperty('access_token');
            accessToken = response.body.access_token;
        });

        it('should fail with invalid refresh token', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/refresh')
                .set('Authorization', 'Bearer invalid-refresh-token')
                .expect(401);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('should logout successfully', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);
        });

        it('should fail without authentication', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/logout')
                .expect(401);
        });
    });
});
