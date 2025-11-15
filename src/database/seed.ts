import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import MainSeeder from './seeder/main.seeder';

// Load environment variables
dotenv.config();

const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'booking_tour',
    entities: [
        __dirname + '/../module/**/entity/*.entity{.ts,.js}',
        __dirname + '/../common/entity/*.entity{.ts,.js}'
    ],
    synchronize: false,
    logging: false,
});

async function runSeeders() {
    try {
        await dataSource.initialize();
        console.log('Running seeders...\n');
        const seeder = new MainSeeder();
        await seeder.run(dataSource);
        await dataSource.destroy();
        
        console.log('\nSeeding completed');
        console.log('\nDefault credentials:');
        console.log('  Admin: admin / password123');
        console.log('  Customer: customer1 / password123');
        console.log('  Supplier: supplier1 / password123');
        
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
        process.exit(1);
    }
}

runSeeders();

