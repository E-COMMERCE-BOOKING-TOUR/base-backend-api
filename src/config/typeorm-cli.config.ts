import { DataSource, DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';
import { databaseConfig } from './database.config';

export default registerAs('typeorm', () => ({ ...databaseConfig() }));
export const connectionSource = new DataSource({
    ...databaseConfig(),
} as DataSourceOptions);
