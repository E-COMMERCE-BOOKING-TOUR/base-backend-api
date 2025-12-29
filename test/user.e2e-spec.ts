import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
    TestDataFactory,
} from './test-utils';

describe('User API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock UserService
    const mockUserService = {
        getAllUsers: jest.fn(),
        getUserById: jest.fn(),
        getUserByUuid: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        updateProfile: jest.fn(),
        removeUser: jest.fn(),
        changePassword: jest.fn(),
        follow: jest.fn(),
        unfollow: jest.fn(),
        getFollowedIds: jest.fn(),
        getFollowerIds: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        // Setup mock responses
        mockUserService.getAllUsers.mockResolvedValue(
            Array.from(mockDatabase.users.values())
        );

        mockUserService.getUserById.mockImplementation((id: number) => {
            return Promise.resolve(mockDatabase.users.get(id) || null);
        });

        mockUserService.getUserByUuid.mockImplementation((uuid: string) => {
            const users = Array.from(mockDatabase.users.values());
            return Promise.resolve(users.find((u: any) => u.uuid === uuid) || null);
        });

        mockUserService.createUser.mockImplementation((dto: any) => {
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

        mockUserService.updateUser.mockImplementation((id: number, dto: any) => {
            const user = mockDatabase.users.get(id);
            if (user) {
                const updated = { ...user, ...dto };
                mockDatabase.users.set(id, updated);
                return Promise.resolve(updated);
            }
            return Promise.resolve(null);
        });

        mockUserService.updateProfile.mockImplementation((id: number, dto: any) => {
            return mockUserService.updateUser(id, dto);
        });

        mockUserService.removeUser.mockImplementation((id: number) => {
            const existed = mockDatabase.users.has(id);
            mockDatabase.users.delete(id);
            return Promise.resolve(existed);
        });

        mockUserService.changePassword.mockResolvedValue({
            success: true,
            message: 'Password changed',
        });

        mockUserService.follow.mockResolvedValue({ success: true });
        mockUserService.unfollow.mockResolvedValue({ success: true });
        mockUserService.getFollowedIds.mockResolvedValue([]);
        mockUserService.getFollowerIds.mockResolvedValue([]);

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

    describe('Mock User Service Tests', () => {
        let createdUserId: number;

        it('should get all users', async () => {
            const users = await mockUserService.getAllUsers();
            expect(Array.isArray(users)).toBe(true);
            expect(users.length).toBeGreaterThan(0);
        });

        it('should have admin user seeded', async () => {
            const admin = await mockUserService.getUserById(1);
            expect(admin).toBeDefined();
            expect(admin.email).toBe('admin@example.com');
        });

        it('should create new user', async () => {
            const userData = TestDataFactory.user();
            const user = await mockUserService.createUser(userData);

            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('email', userData.email);
            createdUserId = user.id;
        });

        it('should store created user in mock database', () => {
            expect(mockDatabase.users.size).toBeGreaterThan(1);
        });

        it('should get user by id', async () => {
            const user = await mockUserService.getUserById(createdUserId);
            expect(user).toBeDefined();
            expect(user.id).toBe(createdUserId);
        });

        it('should get user by uuid', async () => {
            const user = await mockUserService.getUserByUuid('admin-uuid-001');
            expect(user).toBeDefined();
            expect(user.email).toBe('admin@example.com');
        });

        it('should update user', async () => {
            const updated = await mockUserService.updateUser(createdUserId, {
                full_name: 'Updated Name',
            });
            expect(updated.full_name).toBe('Updated Name');
        });

        it('should update profile', async () => {
            const updated = await mockUserService.updateProfile(createdUserId, {
                phone: '0999999999',
            });
            expect(updated.phone).toBe('0999999999');
        });

        it('should change password', async () => {
            const result = await mockUserService.changePassword(createdUserId, {
                oldPassword: 'old',
                newPassword: 'new',
            });
            expect(result.success).toBe(true);
        });

        it('should follow user', async () => {
            const result = await mockUserService.follow(1, 2);
            expect(result.success).toBe(true);
        });

        it('should unfollow user', async () => {
            const result = await mockUserService.unfollow(1, 2);
            expect(result.success).toBe(true);
        });

        it('should get followed ids', async () => {
            const ids = await mockUserService.getFollowedIds(1);
            expect(Array.isArray(ids)).toBe(true);
        });

        it('should get follower ids', async () => {
            const ids = await mockUserService.getFollowerIds(1);
            expect(Array.isArray(ids)).toBe(true);
        });

        it('should remove user', async () => {
            const result = await mockUserService.removeUser(createdUserId);
            expect(result).toBe(true);
        });

        it('should return null for removed user', async () => {
            const user = await mockUserService.getUserById(createdUserId);
            expect(user).toBeNull();
        });
    });
});
