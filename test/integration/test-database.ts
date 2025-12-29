import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenvConfig({ path: path.join(__dirname, '../../.env.test') });

/**
 * Test database configuration
 * Uses separate test database to avoid affecting development/production data
 */
export const testDatabaseConfig: DataSourceOptions = {
    type: (process.env.DB_CONNECTION as 'mysql' | 'postgres') || 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'datn_uit_test',
    entities: [
        path.join(__dirname, '../../src/common/entity/*.entity{.ts,.js}'),
        path.join(__dirname, '../../src/module/**/entity/*.entity{.ts,.js}'),
    ],
    synchronize: true, // Auto-create tables for test
    logging: process.env.DB_LOGGING === 'true',
    dropSchema: false, // Set to true to drop schema before each test run
};

/**
 * Shared test data source instance
 */
let testDataSource: DataSource | null = null;

/**
 * Get or create test database connection
 */
export async function getTestDataSource(): Promise<DataSource> {
    if (testDataSource && testDataSource.isInitialized) {
        return testDataSource;
    }

    testDataSource = new DataSource(testDatabaseConfig);
    await testDataSource.initialize();
    return testDataSource;
}

/**
 * Close test database connection
 */
export async function closeTestDataSource(): Promise<void> {
    if (testDataSource && testDataSource.isInitialized) {
        await testDataSource.destroy();
        testDataSource = null;
    }
}

/**
 * Clean all tables (for test isolation)
 */
export async function cleanDatabase(): Promise<void> {
    const dataSource = await getTestDataSource();
    const entities = dataSource.entityMetadatas;

    // Disable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.query(`TRUNCATE TABLE \`${entity.tableName}\``);
    }

    // Re-enable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
}

/**
 * Seed test data
 */
export async function seedTestData(): Promise<void> {
    const dataSource = await getTestDataSource();

    // Seed roles
    await dataSource.query(`
        INSERT IGNORE INTO roles (id, name, description)
        VALUES 
            (1, 'admin', 'Administrator'),
            (2, 'supplier', 'Tour Supplier'),
            (3, 'user', 'Regular User')
    `);

    // Seed currencies
    await dataSource.query(`
        INSERT IGNORE INTO currencies (id, code, name, symbol)
        VALUES 
            (1, 'VND', 'Vietnamese Dong', '₫'),
            (2, 'USD', 'US Dollar', '\$')
    `);

    // Seed countries
    await dataSource.query(`
        INSERT IGNORE INTO countries (id, name, code)
        VALUES 
            (1, 'Vietnam', 'VN'),
            (2, 'Thailand', 'TH')
    `);
}

/**
 * Get repository from test data source
 */
export async function getTestRepository<T>(entity: new () => T) {
    const dataSource = await getTestDataSource();
    return dataSource.getRepository(entity);
}
