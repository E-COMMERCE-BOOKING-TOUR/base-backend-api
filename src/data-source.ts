import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url as string);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'booking_tour',
    entities: [
        join(__dirname, 'module', '**', 'entity', '*.entity{.ts,.js}'),
        join(__dirname, 'common', 'entity', '*.entity{.ts,.js}')
    ],
    synchronize: false,
    logging: false,
});

export default AppDataSource;

