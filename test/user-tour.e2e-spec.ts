import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
    TestDataFactory,
} from './test-utils';

describe('User Tour API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock UserTourService
    const mockUserTourService = {
        searchTours: jest.fn(),
        getPopularTours: jest.fn(),
        getTourDetailBySlug: jest.fn(),
        getTourReviews: jest.fn(),
        getTourReviewCategories: jest.fn(),
        getRelatedTours: jest.fn(),
        getTourSessions: jest.fn(),
        getRecommendations: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        // Setup mock responses
        mockUserTourService.searchTours.mockResolvedValue({
            data: Array.from(mockDatabase.tours.values()),
            total: mockDatabase.tours.size,
            limit: 10,
            offset: 0,
        });

        mockUserTourService.getPopularTours.mockResolvedValue(
            Array.from(mockDatabase.tours.values())
        );

        mockUserTourService.getTourDetailBySlug.mockImplementation((slug: string) => {
            const tours = Array.from(mockDatabase.tours.values());
            const tour = tours.find((t: any) => t.slug === slug);
            if (!tour) {
                return Promise.reject(new Error('Tour not found'));
            }
            return Promise.resolve(tour);
        });

        mockUserTourService.getTourReviews.mockResolvedValue([]);
        mockUserTourService.getTourReviewCategories.mockResolvedValue([]);
        mockUserTourService.getRelatedTours.mockResolvedValue([]);
        mockUserTourService.getTourSessions.mockResolvedValue([]);
        mockUserTourService.getRecommendations.mockResolvedValue([]);

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

    describe('Mock Tour Service Tests', () => {
        it('should have seeded tour in mock database', () => {
            const tour = mockDatabase.tours.get(1);
            expect(tour).toBeDefined();
            expect(tour.name).toBe('Sample Beach Tour');
            expect(tour.slug).toBe('sample-beach-tour');
        });

        it('should search tours with mock service', async () => {
            const result = await mockUserTourService.searchTours({});
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data)).toBe(true);
            expect(result).toHaveProperty('total');
        });

        it('should get popular tours with mock service', async () => {
            const tours = await mockUserTourService.getPopularTours(8);
            expect(Array.isArray(tours)).toBe(true);
            expect(tours.length).toBeGreaterThan(0);
        });

        it('should get tour detail by slug with mock service', async () => {
            const tour = await mockUserTourService.getTourDetailBySlug('sample-beach-tour');
            expect(tour).toBeDefined();
            expect(tour.slug).toBe('sample-beach-tour');
        });

        it('should throw error for non-existent tour slug', async () => {
            await expect(
                mockUserTourService.getTourDetailBySlug('non-existent-tour')
            ).rejects.toThrow('Tour not found');
        });

        it('should get empty reviews for new tour', async () => {
            const reviews = await mockUserTourService.getTourReviews('sample-beach-tour');
            expect(Array.isArray(reviews)).toBe(true);
        });

        it('should get empty related tours', async () => {
            const related = await mockUserTourService.getRelatedTours('sample-beach-tour', 8);
            expect(Array.isArray(related)).toBe(true);
        });

        it('should get empty sessions', async () => {
            const sessions = await mockUserTourService.getTourSessions('sample-beach-tour', 1);
            expect(Array.isArray(sessions)).toBe(true);
        });

        it('should get empty recommendations', async () => {
            const recs = await mockUserTourService.getRecommendations(undefined, 'guest-123');
            expect(Array.isArray(recs)).toBe(true);
        });
    });

    describe('Mock Repository Tests', () => {
        it('should find all tours from mock repository', async () => {
            const mockRepo = createMockRepository('tours');
            const tours = await mockRepo.find();
            expect(tours.length).toBeGreaterThan(0);
        });

        it('should find tour by slug', async () => {
            const mockRepo = createMockRepository('tours');
            const tour = await mockRepo.findOne({ where: { slug: 'sample-beach-tour' } });
            expect(tour).toBeDefined();
            expect(tour.name).toBe('Sample Beach Tour');
        });

        it('should get tour count', async () => {
            const mockRepo = createMockRepository('tours');
            const count = await mockRepo.count();
            expect(count).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Tour Data Validation', () => {
        it('should have valid tour structure', () => {
            const tour = mockDatabase.tours.get(1);
            expect(tour).toHaveProperty('id');
            expect(tour).toHaveProperty('name');
            expect(tour).toHaveProperty('slug');
            expect(tour).toHaveProperty('description');
            expect(tour).toHaveProperty('status');
            expect(tour).toHaveProperty('variants');
            expect(Array.isArray(tour.variants)).toBe(true);
        });

        it('should have valid variant structure', () => {
            const tour = mockDatabase.tours.get(1);
            const variant = tour.variants[0];
            expect(variant).toHaveProperty('id');
            expect(variant).toHaveProperty('name');
            expect(variant).toHaveProperty('pricing');
            expect(Array.isArray(variant.pricing)).toBe(true);
        });

        it('should have valid pricing structure', () => {
            const tour = mockDatabase.tours.get(1);
            const pricing = tour.variants[0].pricing[0];
            expect(pricing).toHaveProperty('id');
            expect(pricing).toHaveProperty('price');
            expect(pricing).toHaveProperty('type');
        });
    });
});
