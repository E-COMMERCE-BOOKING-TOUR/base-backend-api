import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import MainSeeder from './seeder/main.seeder';
import * as mysql from 'mysql2/promise';

dotenv.config();

async function freshDatabase() {
    const dbName = process.env.DATABASE_NAME || 'booking_tour';

    // Create connection without database
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'mysq',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || 'root',
    });

    try {
        await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await connection.query(
            `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        );
        await connection.end();

        // Initialize DataSource
        const dataSource = new DataSource({
            type: 'mysql',
            host: process.env.DATABASE_HOST || 'mysq',
            port: parseInt(process.env.DATABASE_PORT || '3306'),
            username: process.env.DATABASE_USER || 'root',
            password: process.env.DATABASE_PASSWORD || 'root',
            database: dbName,
            entities: [
                __dirname + '/../module/**/entity/*.entity{.ts,.js}',
                __dirname + '/../common/entity/*.entity{.ts,.js}',
            ],
            synchronize: true,
            logging: false,
        });

        console.log('Running database fresh...\n');
        await dataSource.initialize();

        const seeder = new MainSeeder();
        await seeder.run(dataSource);

        await dataSource.destroy();

        console.log('\nDatabase fresh completed');
        console.log('\nDefault credentials:');
        console.log('  Admin: admin / password123');
        console.log('  Customer: customer1 / password123');
        console.log('  Supplier: supplier1 / password123');

        process.exit(0);
    } catch (error: any) {
        console.error('Error:', error.message);
        await connection.end();
        process.exit(1);
    }
}

freshDatabase();
