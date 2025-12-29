import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

describe('User API (Integration)', () => {
    let app: INestApplication<App>;
    let accessToken: string;
    let userId: number;
    let userUuid: string;
    const testUserEmail = `user_int_${Date.now()}@example.com`;
    const testUserPassword = 'TestPassword@123';

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

        // Register and login to get token
        const registerResponse = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
                email: testUserEmail,
                password: testUserPassword,
                full_name: 'User Integration Test',
                phone: '0912345679',
            });

        if (registerResponse.status === 201) {
            accessToken = registerResponse.body.access_token;
            userId = registerResponse.body.user.id;
            userUuid = registerResponse.body.user.uuid;
        }
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/user/getAll', () => {
        it('should get all users', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/getAll')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('POST /api/v1/user/getById', () => {
        it('should get user by id', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/user/getById')
                .send({ id: userId })
                .expect(201);

            expect(response.body).toHaveProperty('id', userId);
            expect(response.body).toHaveProperty('email', testUserEmail);
        });

        it('should return null for non-existent user', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/user/getById')
                .send({ id: 999999 })
                .expect(201);

            expect(response.body).toBeNull();
        });
    });

    describe('GET /api/v1/user/getByUuid/:uuid', () => {
        it('should get user by uuid', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/user/getByUuid/${userUuid}`)
                .expect(200);

            expect(response.body).toHaveProperty('uuid', userUuid);
        });
    });

    describe('POST /api/v1/user/update-me', () => {
        it('should update own profile', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/user/update-me')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    data: {
                        full_name: 'Updated Integration Name',
                    },
                })
                .expect(200);

            expect(response.body).toHaveProperty('full_name', 'Updated Integration Name');
        });

        it('should fail without authentication', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/user/update-me')
                .send({ data: { full_name: 'Test' } })
                .expect(401);
        });
    });

    describe('POST /api/v1/user/change-password', () => {
        it('should change password with correct old password', async () => {
            const newPassword = 'NewPassword@123';

            const response = await request(app.getHttpServer())
                .post('/api/v1/user/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    data: {
                        oldPassword: testUserPassword,
                        newPassword: newPassword,
                        confirmPassword: newPassword,
                    },
                })
                .expect(200);

            expect(response.body).toBeDefined();

            // Verify can login with new password
            const loginResponse = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUserEmail,
                    password: newPassword,
                })
                .expect(201);

            accessToken = loginResponse.body.access_token;
        });

        it('should fail without authentication', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/user/change-password')
                .send({
                    data: {
                        oldPassword: 'old',
                        newPassword: 'new',
                    },
                })
                .expect(401);
        });
    });

    describe('Follow System', () => {
        let targetUserId: number;

        beforeAll(async () => {
            // Create another user to follow
            const anotherUserEmail = `follow_target_${Date.now()}@example.com`;
            const response = await request(app.getHttpServer())
                .post('/api/v1/user/create')
                .send({
                    email: anotherUserEmail,
                    password: 'Password@123',
                    full_name: 'Follow Target',
                });

            if (response.status === 201) {
                targetUserId = response.body.id;
            }
        });

        it('should follow a user', async () => {
            if (!targetUserId) return;

            const response = await request(app.getHttpServer())
                .post(`/api/v1/user/follow/${targetUserId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body).toBeDefined();
        });

        it('should get following list', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/user/following')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should unfollow a user', async () => {
            if (!targetUserId) return;

            const response = await request(app.getHttpServer())
                .post(`/api/v1/user/unfollow/${targetUserId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body).toBeDefined();
        });
    });
});
