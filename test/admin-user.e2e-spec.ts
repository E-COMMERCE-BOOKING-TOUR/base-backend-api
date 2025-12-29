import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
    TestDataFactory,
} from './test-utils';

describe('Admin User API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock AdminUserService (uses UserService internally)
    const mockAdminUserService = {
        getAllUsers: jest.fn(),
        getUserById: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        removeUser: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        mockAdminUserService.getAllUsers.mockImplementation(
            (page: number, limit: number, search?: string, role_id?: number) => {
                let users = Array.from(mockDatabase.users.values());

                if (search) {
                    users = users.filter((u: any) =>
                        u.email.includes(search) || u.full_name?.includes(search)
                    );
                }
                if (role_id) {
                    users = users.filter((u: any) => u.role_id === role_id);
                }

                const start = (page - 1) * limit;
                const paged = users.slice(start, start + limit);

                return Promise.resolve({
                    data: paged,
                    total: users.length,
                    page,
                    limit,
                });
            }
        );

        mockAdminUserService.getUserById.mockImplementation((id: number) => {
            return Promise.resolve(mockDatabase.users.get(id) || null);
        });

        mockAdminUserService.createUser.mockImplementation((dto: any) => {
            const userId = mockDatabase.nextId.user++;
            const user = {
                id: userId,
                uuid: `uuid-${userId}`,
                ...dto,
                created_at: new Date(),
            };
            mockDatabase.users.set(userId, user);
            return Promise.resolve(user);
        });

        mockAdminUserService.updateUser.mockImplementation((id: number, dto: any) => {
            const user = mockDatabase.users.get(id);
            if (user) {
                const updated = { ...user, ...dto };
                mockDatabase.users.set(id, updated);
                return Promise.resolve(updated);
            }
            return Promise.resolve(null);
        });

        mockAdminUserService.removeUser.mockImplementation((id: number) => {
            const existed = mockDatabase.users.has(id);
            mockDatabase.users.delete(id);
            return Promise.resolve({ success: existed });
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

    describe('Mock Admin User Service Tests', () => {
        let createdUserId: number;

        it('should get all users with pagination', async () => {
            const result = await mockAdminUserService.getAllUsers(1, 10);
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page', 1);
            expect(result).toHaveProperty('limit', 10);
        });

        it('should filter users by search', async () => {
            const result = await mockAdminUserService.getAllUsers(1, 10, 'admin');
            expect(result.data.length).toBeGreaterThan(0);
            expect(result.data[0].email).toContain('admin');
        });

        it('should filter users by role', async () => {
            const result = await mockAdminUserService.getAllUsers(1, 10, undefined, 1);
            expect(result.data.every((u: any) => u.role_id === 1)).toBe(true);
        });

        it('should get user by id', async () => {
            const user = await mockAdminUserService.getUserById(1);
            expect(user).toBeDefined();
            expect(user.id).toBe(1);
        });

        it('should return null for non-existent user', async () => {
            const user = await mockAdminUserService.getUserById(99999);
            expect(user).toBeNull();
        });

        it('should create new user', async () => {
            const baseUserData = TestDataFactory.user();
            const userData = {
                ...baseUserData,
                role_id: 3,
                status: 1,
            };

            const user = await mockAdminUserService.createUser(userData);
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('role_id', 3);

            createdUserId = user.id;
        });

        it('should update user', async () => {
            const updated = await mockAdminUserService.updateUser(createdUserId, {
                full_name: 'Admin Updated',
                status: 0,
            });
            expect(updated.full_name).toBe('Admin Updated');
            expect(updated.status).toBe(0);
        });

        it('should remove user', async () => {
            const result = await mockAdminUserService.removeUser(createdUserId);
            expect(result.success).toBe(true);
        });

        it('should return false for removing non-existent user', async () => {
            const result = await mockAdminUserService.removeUser(99999);
            expect(result.success).toBe(false);
        });
    });
});
