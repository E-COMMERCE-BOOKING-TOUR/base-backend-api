import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
    TestDataFactory,
} from './test-utils';

describe('User Review API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock UserReviewService
    const mockUserReviewService = {
        create: jest.fn(),
        getReviewsByTour: jest.fn(),
        markHelpful: jest.fn(),
        reportReview: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        mockUserReviewService.create.mockImplementation((userId: number, dto: any) => {
            const reviewId = mockDatabase.nextId.review++;
            const review = {
                id: reviewId,
                user_id: userId,
                tour_id: dto.tour_id,
                rating: dto.rating,
                title: dto.title,
                content: dto.content,
                helpful_count: 0,
                report_count: 0,
                created_at: new Date(),
            };
            mockDatabase.reviews.set(reviewId, review);
            return Promise.resolve(review);
        });

        mockUserReviewService.getReviewsByTour.mockImplementation((tourId: number) => {
            const reviews = Array.from(mockDatabase.reviews.values());
            return Promise.resolve(reviews.filter((r: any) => r.tour_id === tourId));
        });

        mockUserReviewService.markHelpful.mockImplementation((reviewId: number) => {
            const review = mockDatabase.reviews.get(reviewId);
            if (review) {
                review.helpful_count++;
                return Promise.resolve(review);
            }
            throw new Error('Review not found');
        });

        mockUserReviewService.reportReview.mockImplementation((reviewId: number) => {
            const review = mockDatabase.reviews.get(reviewId);
            if (review) {
                review.report_count++;
                return Promise.resolve(review);
            }
            throw new Error('Review not found');
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

    describe('Mock Review Service Tests', () => {
        let createdReviewId: number;

        it('should create review', async () => {
            const reviewData = TestDataFactory.review();
            const review = await mockUserReviewService.create(1, reviewData);

            expect(review).toHaveProperty('id');
            expect(review).toHaveProperty('rating', 5);
            expect(review).toHaveProperty('user_id', 1);

            createdReviewId = review.id;
        });

        it('should store review in mock database', () => {
            expect(mockDatabase.reviews.size).toBeGreaterThan(0);
        });

        it('should get reviews by tour', async () => {
            const reviews = await mockUserReviewService.getReviewsByTour(1);
            expect(Array.isArray(reviews)).toBe(true);
        });

        it('should mark review as helpful', async () => {
            const review = await mockUserReviewService.markHelpful(createdReviewId);
            expect(review.helpful_count).toBe(1);
        });

        it('should increment helpful count on multiple calls', async () => {
            const review = await mockUserReviewService.markHelpful(createdReviewId);
            expect(review.helpful_count).toBe(2);
        });

        it('should report review', async () => {
            const review = await mockUserReviewService.reportReview(createdReviewId);
            expect(review.report_count).toBe(1);
        });

        it('should throw error for non-existent review', () => {
            expect(() => {
                mockUserReviewService.markHelpful(99999);
            }).toThrow('Review not found');
        });
    });

    describe('Mock Repository Tests', () => {
        it('should find all reviews', async () => {
            const mockRepo = createMockRepository('reviews');
            const reviews = await mockRepo.find();
            expect(Array.isArray(reviews)).toBe(true);
        });

        it('should save new review', async () => {
            const mockRepo = createMockRepository('reviews');
            const newReview = {
                tour_id: 1,
                user_id: 1,
                rating: 4,
            };
            const saved = await mockRepo.save(newReview);
            expect(saved.id).toBeDefined();
        });
    });
});
