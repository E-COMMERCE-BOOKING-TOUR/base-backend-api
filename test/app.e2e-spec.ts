import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { mockDatabase } from './test-utils';

describe('App E2E Tests - Mocked', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        mockDatabase.reset();

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

    describe('Mock Database Health Check', () => {
        it('should have mock database initialized', () => {
            expect(mockDatabase).toBeDefined();
            expect(mockDatabase.users).toBeDefined();
            expect(mockDatabase.tours).toBeDefined();
        });

        it('should have seeded data', () => {
            expect(mockDatabase.users.size).toBeGreaterThan(0);
            expect(mockDatabase.countries.size).toBeGreaterThan(0);
        });

        it('should reset database properly', () => {
            const initialSize = mockDatabase.users.size;
            mockDatabase.reset();
            expect(mockDatabase.users.size).toBe(initialSize); // Same after reset (seeded)
        });
    });
});
