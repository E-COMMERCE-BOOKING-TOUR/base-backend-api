import { DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables for npm run typeorm
dotenvConfig({ path: '.env' });

export const databaseConfig = (): DataSourceOptions => ({
    type: process.env.DB_CONNECTION as 'mysql' | 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        __dirname + '/../common/entity/*.entity{.ts,.js}',
        __dirname + '/../module/**/entity/*.entity{.ts,.js}',
    ],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
    migrations: [__dirname + '/../database/migration/*.ts'],
});
