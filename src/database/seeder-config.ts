import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

export const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'mysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'booking_tour',
    entities: [
        join(__dirname, '..', 'module', '**', 'entity', '*.entity.{ts,js}'),
        join(__dirname, '..', 'common', 'entity', '*.entity.{ts,js}'),
    ],
    synchronize: false,
    logging: false,
} as DataSourceOptions);

export default dataSource;
