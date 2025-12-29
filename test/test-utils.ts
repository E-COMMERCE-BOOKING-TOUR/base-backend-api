import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';

/**
 * Mock Data Storage - In-memory database simulation
 */
export const mockDatabase = {
    users: new Map<number, any>(),
    tours: new Map<number, any>(),
    bookings: new Map<number, any>(),
    reviews: new Map<number, any>(),
    articles: new Map<string, any>(),
    sessions: new Map<number, any>(),
    divisions: new Map<number, any>(),
    countries: new Map<number, any>(),
    currencies: new Map<number, any>(),

    // Auto-increment IDs
    nextId: {
        user: 1,
        tour: 1,
        booking: 1,
        review: 1,
        session: 1,
    },

    // Reset all data between tests
    reset() {
        this.users.clear();
        this.tours.clear();
        this.bookings.clear();
        this.reviews.clear();
        this.articles.clear();
        this.sessions.clear();
        this.nextId = { user: 1, tour: 1, booking: 1, review: 1, session: 1 };

        // Seed default data
        this.seedDefaultData();
    },

    seedDefaultData() {
        // Seed admin user
        this.users.set(1, {
            id: 1,
            uuid: 'admin-uuid-001',
            email: 'admin@example.com',
            password: '$2b$10$hashedpassword', // bcrypt hash
            full_name: 'Admin User',
            phone: '0123456789',
            role_id: 1,
            status: 1,
            created_at: new Date(),
        });

        // Seed countries
        this.countries.set(1, { id: 1, name: 'Vietnam', code: 'VN' });
        this.countries.set(2, { id: 2, name: 'Thailand', code: 'TH' });

        // Seed divisions
        this.divisions.set(1, { id: 1, name: 'Ho Chi Minh City', country_id: 1, level: 1 });
        this.divisions.set(2, { id: 2, name: 'Ha Noi', country_id: 1, level: 1 });

        // Seed currencies
        this.currencies.set(1, { id: 1, code: 'VND', name: 'Vietnamese Dong', symbol: '₫' });
        this.currencies.set(2, { id: 2, code: 'USD', name: 'US Dollar', symbol: '$' });

        // Seed sample tour
        this.tours.set(1, {
            id: 1,
            name: 'Sample Beach Tour',
            slug: 'sample-beach-tour',
            description: 'A beautiful beach tour',
            short_description: 'Beach tour',
            duration_days: 3,
            division_id: 1,
            currency_id: 1,
            status: 'active',
            is_visible: true,
            variants: [
                {
                    id: 1,
                    name: 'Standard',
                    pricing: [{ id: 1, price: 1000000, type: 'adult' }],
                },
            ],
        });

        this.nextId.user = 2;
        this.nextId.tour = 2;
    },
};

/**
 * Create Mock Repository Factory
 */
export function createMockRepository<T>(entityName: string) {
    const storage = mockDatabase[entityName as keyof typeof mockDatabase] as Map<any, T>;

    return {
        find: jest.fn().mockImplementation((options?: any) => {
            const items = Array.from(storage?.values() || []);
            if (options?.where) {
                return Promise.resolve(items.filter((item: any) => {
                    return Object.entries(options.where).every(([key, val]) => item[key] === val);
                }));
            }
            return Promise.resolve(items);
        }),

        findOne: jest.fn().mockImplementation((options: any) => {
            if (options?.where?.id) {
                return Promise.resolve(storage?.get(options.where.id) || null);
            }
            if (options?.where?.email) {
                const items = Array.from(storage?.values() || []);
                return Promise.resolve(items.find((item: any) => item.email === options.where.email) || null);
            }
            if (options?.where?.uuid) {
                const items = Array.from(storage?.values() || []);
                return Promise.resolve(items.find((item: any) => item.uuid === options.where.uuid) || null);
            }
            if (options?.where?.slug) {
                const items = Array.from(storage?.values() || []);
                return Promise.resolve(items.find((item: any) => item.slug === options.where.slug) || null);
            }
            return Promise.resolve(null);
        }),

        findOneBy: jest.fn().mockImplementation((where: any) => {
            if (where?.id) {
                return Promise.resolve(storage?.get(where.id) || null);
            }
            const items = Array.from(storage?.values() || []);
            return Promise.resolve(items.find((item: any) => {
                return Object.entries(where).every(([key, val]) => item[key] === val);
            }) || null);
        }),

        save: jest.fn().mockImplementation((entity: any) => {
            if (!entity.id) {
                const idKey = entityName.slice(0, -1) as keyof typeof mockDatabase.nextId;
                entity.id = mockDatabase.nextId[idKey]++;
            }
            storage?.set(entity.id, { ...entity });
            return Promise.resolve(entity);
        }),

        create: jest.fn().mockImplementation((dto: any) => dto),

        update: jest.fn().mockImplementation((id: number, dto: any) => {
            const existing = storage?.get(id);
            if (existing) {
                storage?.set(id, { ...existing, ...dto });
            }
            return Promise.resolve({ affected: existing ? 1 : 0 });
        }),

        delete: jest.fn().mockImplementation((id: number) => {
            const existed = storage?.has(id);
            storage?.delete(id);
            return Promise.resolve({ affected: existed ? 1 : 0 });
        }),

        remove: jest.fn().mockImplementation((entity: any) => {
            storage?.delete(entity.id);
            return Promise.resolve(entity);
        }),

        count: jest.fn().mockImplementation(() => Promise.resolve(storage?.size || 0)),

        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orWhere: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            innerJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            setParameter: jest.fn().mockReturnThis(),
            setParameters: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(Array.from(storage?.values() || [])),
            getOne: jest.fn().mockResolvedValue(Array.from(storage?.values() || [])[0] || null),
            getManyAndCount: jest.fn().mockResolvedValue([Array.from(storage?.values() || []), storage?.size || 0]),
            getCount: jest.fn().mockResolvedValue(storage?.size || 0),
            getRawMany: jest.fn().mockResolvedValue([]),
            getRawOne: jest.fn().mockResolvedValue(null),
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
        }),
    };
}

/**
 * Test user credentials
 */
export const TEST_USER = {
    email: 'test@example.com',
    password: 'Test@123456',
    full_name: 'Test User',
    phone: '0123456789',
};

export const TEST_ADMIN = {
    email: 'admin@example.com',
    password: 'Admin@123456',
};

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Generate unique test phone
 */
export function generateTestPhone(): string {
    return `09${Math.floor(10000000 + Math.random() * 90000000)}`;
}

/**
 * Test data factories
 */
export const TestDataFactory = {
    user: (overrides?: Partial<typeof TEST_USER>) => ({
        ...TEST_USER,
        email: generateTestEmail(),
        phone: generateTestPhone(),
        ...overrides,
    }),

    booking: (overrides?: Record<string, unknown>) => ({
        tour_session_id: 1,
        participants: [
            {
                pricing_id: 1,
                quantity: 2,
            },
        ],
        ...overrides,
    }),

    review: (overrides?: Record<string, unknown>) => ({
        tour_id: 1,
        rating: 5,
        title: 'Great tour!',
        content: 'This was an amazing experience.',
        categories: [
            { category_id: 1, score: 5 },
            { category_id: 2, score: 4 },
        ],
        ...overrides,
    }),

    article: (overrides?: Record<string, unknown>) => ({
        title: 'Test Article',
        content: 'This is a test article content.',
        excerpt: 'Test excerpt',
        tags: ['test', 'e2e'],
        status: 'published',
        ...overrides,
    }),

    tour: (overrides?: Record<string, unknown>) => ({
        name: `Test Tour ${Date.now()}`,
        slug: `test-tour-${Date.now()}`,
        description: 'Test tour description',
        short_description: 'Test tour',
        duration_days: 3,
        division_id: 1,
        currency_id: 1,
        status: 'draft',
        is_visible: true,
        ...overrides,
    }),
};

/**
 * Mock JWT Service
 */
export const mockJwtService = {
    sign: jest.fn().mockImplementation((payload: any) => {
        return `mock-jwt-token-${payload.sub || payload.id || 'unknown'}`;
    }),
    signAsync: jest.fn().mockImplementation((payload: any) => {
        return Promise.resolve(`mock-jwt-token-${payload.sub || payload.id || 'unknown'}`);
    }),
    verify: jest.fn().mockImplementation((token: string) => {
        const match = token.match(/mock-jwt-token-(\d+)/);
        if (match) {
            return { sub: parseInt(match[1]), id: parseInt(match[1]) };
        }
        throw new Error('Invalid token');
    }),
    verifyAsync: jest.fn().mockImplementation((token: string) => {
        const match = token.match(/mock-jwt-token-(\d+)/);
        if (match) {
            return Promise.resolve({ sub: parseInt(match[1]), id: parseInt(match[1]) });
        }
        return Promise.reject(new Error('Invalid token'));
    }),
};

/**
 * Mock Microservice Client (for recommend, chatbox, etc.)
 */
export const mockMicroserviceClient = {
    send: jest.fn().mockImplementation(() => ({
        toPromise: () => Promise.resolve({ success: true }),
        subscribe: (observer: any) => observer.next({ success: true }),
    })),
    emit: jest.fn().mockReturnValue(undefined),
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
};

/**
 * Mock Cloudinary Service
 */
export const mockCloudinaryService = {
    uploadFile: jest.fn().mockResolvedValue({
        url: 'https://mock-cloudinary.com/image.jpg',
        public_id: 'mock-public-id',
    }),
    deleteFile: jest.fn().mockResolvedValue({ result: 'ok' }),
};

/**
 * Mock Mail Service
 */
export const mockMailService = {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
    sendPasswordReset: jest.fn().mockResolvedValue(true),
    sendBookingConfirmation: jest.fn().mockResolvedValue(true),
};

/**
 * Create authenticated request with JWT token
 */
export function authRequest(
    app: INestApplication<App>,
    token: string,
) {
    return {
        get: (url: string) =>
            request(app.getHttpServer())
                .get(url)
                .set('Authorization', `Bearer ${token}`),
        post: (url: string) =>
            request(app.getHttpServer())
                .post(url)
                .set('Authorization', `Bearer ${token}`),
        put: (url: string) =>
            request(app.getHttpServer())
                .put(url)
                .set('Authorization', `Bearer ${token}`),
        patch: (url: string) =>
            request(app.getHttpServer())
                .patch(url)
                .set('Authorization', `Bearer ${token}`),
        delete: (url: string) =>
            request(app.getHttpServer())
                .delete(url)
                .set('Authorization', `Bearer ${token}`),
    };
}
