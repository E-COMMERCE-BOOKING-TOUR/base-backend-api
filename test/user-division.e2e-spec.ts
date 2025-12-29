import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
} from './test-utils';

describe('User Division API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock DivisionService
    const mockDivisionService = {
        getTrendingDestinations: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        mockDivisionService.getTrendingDestinations.mockImplementation((limit: number) => {
            const divisions = Array.from(mockDatabase.divisions.values());
            return Promise.resolve(divisions.slice(0, limit));
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

    describe('Mock Database Seed Tests', () => {
        it('should have seeded countries', () => {
            expect(mockDatabase.countries.size).toBeGreaterThan(0);
            const vietnam = mockDatabase.countries.get(1);
            expect(vietnam).toBeDefined();
            expect(vietnam.name).toBe('Vietnam');
            expect(vietnam.code).toBe('VN');
        });

        it('should have seeded divisions', () => {
            expect(mockDatabase.divisions.size).toBeGreaterThan(0);
            const hcm = mockDatabase.divisions.get(1);
            expect(hcm).toBeDefined();
            expect(hcm.name).toBe('Ho Chi Minh City');
            expect(hcm.country_id).toBe(1);
        });

        it('should have seeded currencies', () => {
            expect(mockDatabase.currencies.size).toBeGreaterThan(0);
            const vnd = mockDatabase.currencies.get(1);
            expect(vnd).toBeDefined();
            expect(vnd.code).toBe('VND');
        });
    });

    describe('Mock Repository Tests', () => {
        it('should find all countries', async () => {
            const mockRepo = createMockRepository('countries');
            const countries = await mockRepo.find();
            expect(countries.length).toBeGreaterThan(0);
        });

        it('should find all divisions', async () => {
            const mockRepo = createMockRepository('divisions');
            const divisions = await mockRepo.find();
            expect(divisions.length).toBeGreaterThan(0);
        });

        it('should find division by id', async () => {
            const mockRepo = createMockRepository('divisions');
            const division = await mockRepo.findOne({ where: { id: 1 } });
            expect(division).toBeDefined();
            expect(division.name).toBe('Ho Chi Minh City');
        });
    });

    describe('Mock Service Tests', () => {
        it('should get trending destinations with default limit', async () => {
            const trending = await mockDivisionService.getTrendingDestinations(6);
            expect(Array.isArray(trending)).toBe(true);
            expect(trending.length).toBeLessThanOrEqual(6);
        });

        it('should get trending destinations with custom limit', async () => {
            const trending = await mockDivisionService.getTrendingDestinations(1);
            expect(trending.length).toBeLessThanOrEqual(1);
        });
    });
});
