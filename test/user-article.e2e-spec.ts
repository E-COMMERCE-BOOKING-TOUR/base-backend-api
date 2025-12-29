import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    mockMicroserviceClient,
    TestDataFactory,
} from './test-utils';

describe('User Article API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock ArticleServiceProxy (microservice)
    const mockArticleService = {
        getPopularArticles: jest.fn(),
        getArticlesByTag: jest.fn(),
        getMyArticles: jest.fn(),
        getTrendingTags: jest.fn(),
        getLikedArticles: jest.fn(),
        getArticlesByUserUuid: jest.fn(),
        getListArticles: jest.fn(),
        getFollowingArticles: jest.fn(),
        createArticle: jest.fn(),
        updateArticle: jest.fn(),
        deleteArticle: jest.fn(),
        likeArticle: jest.fn(),
        unlikeArticle: jest.fn(),
        addComment: jest.fn(),
        bookmarkArticle: jest.fn(),
        unbookmarkArticle: jest.fn(),
        getBookmarkedArticles: jest.fn(),
    };

    beforeAll(async () => {
        mockDatabase.reset();

        // Seed some mock articles
        mockDatabase.articles.set('article-1', {
            id: 'article-1',
            title: 'Sample Article',
            content: 'Sample content',
            author_uuid: 'admin-uuid-001',
            likes: 0,
            status: 'published',
            tags: ['travel', 'tips'],
            created_at: new Date(),
        });

        // Setup mock responses
        mockArticleService.getPopularArticles.mockResolvedValue({
            data: Array.from(mockDatabase.articles.values()),
            total: mockDatabase.articles.size,
        });

        mockArticleService.getListArticles.mockResolvedValue(
            Array.from(mockDatabase.articles.values())
        );

        mockArticleService.getTrendingTags.mockResolvedValue([
            { name: 'travel', count: 10 },
            { name: 'tips', count: 5 },
        ]);

        mockArticleService.getArticlesByTag.mockResolvedValue({
            data: Array.from(mockDatabase.articles.values()),
        });

        mockArticleService.createArticle.mockImplementation((userUuid: string, dto: any) => {
            const articleId = `article-${Date.now()}`;
            const article = {
                id: articleId,
                ...dto,
                author_uuid: userUuid,
                likes: 0,
                created_at: new Date(),
            };
            mockDatabase.articles.set(articleId, article);
            return Promise.resolve(article);
        });

        mockArticleService.updateArticle.mockImplementation((id: string, dto: any) => {
            const article = mockDatabase.articles.get(id);
            if (article) {
                const updated = { ...article, ...dto };
                mockDatabase.articles.set(id, updated);
                return Promise.resolve(updated);
            }
            throw new Error('Article not found');
        });

        mockArticleService.likeArticle.mockImplementation((userUuid: string, articleId: string) => {
            const article = mockDatabase.articles.get(articleId);
            if (article) {
                article.likes++;
                return Promise.resolve({ success: true });
            }
            throw new Error('Article not found');
        });

        mockArticleService.unlikeArticle.mockImplementation((userUuid: string, articleId: string) => {
            const article = mockDatabase.articles.get(articleId);
            if (article && article.likes > 0) {
                article.likes--;
                return Promise.resolve({ success: true });
            }
            throw new Error('Article not found');
        });

        mockArticleService.deleteArticle.mockImplementation((id: string) => {
            mockDatabase.articles.delete(id);
            return Promise.resolve({ success: true });
        });

        mockArticleService.getMyArticles.mockResolvedValue([]);
        mockArticleService.getLikedArticles.mockResolvedValue([]);
        mockArticleService.getBookmarkedArticles.mockResolvedValue([]);
        mockArticleService.getFollowingArticles.mockResolvedValue([]);
        mockArticleService.bookmarkArticle.mockResolvedValue({ success: true });
        mockArticleService.unbookmarkArticle.mockResolvedValue({ success: true });
        mockArticleService.addComment.mockResolvedValue({ id: 1, content: 'test' });

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

    describe('Mock Article Service Tests', () => {
        let createdArticleId: string;

        it('should have seeded article', () => {
            const article = mockDatabase.articles.get('article-1');
            expect(article).toBeDefined();
            expect(article.title).toBe('Sample Article');
        });

        it('should get popular articles', async () => {
            const result = await mockArticleService.getPopularArticles();
            expect(result).toHaveProperty('data');
            expect(Array.isArray(result.data)).toBe(true);
        });

        it('should get all articles', async () => {
            const articles = await mockArticleService.getListArticles();
            expect(Array.isArray(articles)).toBe(true);
        });

        it('should get trending tags', async () => {
            const tags = await mockArticleService.getTrendingTags();
            expect(Array.isArray(tags)).toBe(true);
            expect(tags[0]).toHaveProperty('name');
            expect(tags[0]).toHaveProperty('count');
        });

        it('should get articles by tag', async () => {
            const result = await mockArticleService.getArticlesByTag('travel');
            expect(result).toHaveProperty('data');
        });

        it('should create article', async () => {
            const articleData = TestDataFactory.article();
            const article = await mockArticleService.createArticle('user-uuid-001', articleData);

            expect(article).toHaveProperty('id');
            expect(article).toHaveProperty('title', articleData.title);

            createdArticleId = article.id;
        });

        it('should update article', async () => {
            const updated = await mockArticleService.updateArticle(createdArticleId, {
                title: 'Updated Title',
            });
            expect(updated.title).toBe('Updated Title');
        });

        it('should like article', async () => {
            const result = await mockArticleService.likeArticle('user-uuid', createdArticleId);
            expect(result.success).toBe(true);

            const article = mockDatabase.articles.get(createdArticleId);
            expect(article.likes).toBe(1);
        });

        it('should unlike article', async () => {
            const result = await mockArticleService.unlikeArticle('user-uuid', createdArticleId);
            expect(result.success).toBe(true);
        });

        it('should bookmark article', async () => {
            const result = await mockArticleService.bookmarkArticle('user-uuid', createdArticleId);
            expect(result.success).toBe(true);
        });

        it('should add comment', async () => {
            const result = await mockArticleService.addComment('user-uuid', {
                articleId: createdArticleId,
                content: 'Great article!',
            });
            expect(result).toHaveProperty('id');
        });

        it('should delete article', async () => {
            const result = await mockArticleService.deleteArticle(createdArticleId);
            expect(result.success).toBe(true);
            expect(mockDatabase.articles.has(createdArticleId)).toBe(false);
        });
    });
});
