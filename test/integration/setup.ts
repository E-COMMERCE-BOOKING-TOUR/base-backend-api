import {
    getTestDataSource,
    closeTestDataSource,
    seedTestData,
} from './test-database';

/**
 * Global setup for integration tests
 * Runs once before all test suites
 */
beforeAll(async () => {
    console.log('🔧 Setting up integration test environment...');

    try {
        // Initialize database connection
        const dataSource = await getTestDataSource();
        console.log(`Connected to test database: ${dataSource.options.database}`);

        // Seed initial data
        await seedTestData();
        console.log('Test data seeded');
    } catch (error) {
        console.error('Failed to setup test database:', error);
        throw error;
    }
});

/**
 * Global teardown for integration tests
 * Runs once after all test suites
 */
afterAll(async () => {
    console.log('Cleaning up integration test environment...');

    try {
        await closeTestDataSource();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Failed to cleanup:', error);
    }
});

/**
 * Increase Jest timeout for integration tests
 */
jest.setTimeout(60000);
