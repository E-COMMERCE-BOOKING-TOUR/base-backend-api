import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config();

export const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'booking_tour',
    entities: [
        join(__dirname, '..', 'module', '**', 'entity', '*.entity.{ts,js}'),
        join(__dirname, '..', 'common', 'entity', '*.entity.{ts,js}')
    ],
    synchronize: false,
    logging: false,
} as any);

export default dataSource;

