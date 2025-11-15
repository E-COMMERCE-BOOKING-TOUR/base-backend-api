import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UserEntity } from '@/module/user/entity/user.entity';
import { RoleEntity } from '@/module/user/entity/role.entity';
import { SupplierEntity } from '@/module/user/entity/supplier.entity';
import { CountryEntity } from '@/common/entity/country.entity';
import { hashPassword } from '@/utils/bcrypt.util';
import { v4 as uuidv4 } from 'uuid';

export default class UserSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const userRepository = dataSource.getRepository(UserEntity);
        const roleRepository = dataSource.getRepository(RoleEntity);
        const supplierRepository = dataSource.getRepository(SupplierEntity);
        const countryRepository = dataSource.getRepository(CountryEntity);

        // Get roles
        const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
        const supplierRole = await roleRepository.findOne({ where: { name: 'supplier' } });
        const customerRole = await roleRepository.findOne({ where: { name: 'customer' } });
        const contentRole = await roleRepository.findOne({ where: { name: 'content_manager' } });
        const moderatorRole = await roleRepository.findOne({ where: { name: 'moderator' } });

        // Get Vietnam
        const vietnam = await countryRepository.findOne({ where: { iso3: 'VN' } });
        const usa = await countryRepository.findOne({ where: { iso3: 'US' } });

        // Get suppliers
        const suppliers = await supplierRepository.find();

        const hashedPassword = await hashPassword('password123');

        const users = [
            // Admin users
            {
                uuid: uuidv4(),
                username: 'admin',
                password: hashedPassword,
                full_name: 'System Administrator',
                email: 'admin@bookintour.vn',
                phone: '0901234567',
                status: 1,
                login_type: 0,
                role: adminRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'admin2',
                password: hashedPassword,
                full_name: 'Nguyễn Văn Admin',
                email: 'admin2@bookintour.vn',
                phone: '0901234568',
                status: 1,
                login_type: 0,
                role: adminRole,
                country: vietnam,
                supplier: null,
            },
            // Content managers
            {
                uuid: uuidv4(),
                username: 'content_manager',
                password: hashedPassword,
                full_name: 'Trần Thị Content',
                email: 'content@bookintour.vn',
                phone: '0902345678',
                status: 1,
                login_type: 0,
                role: contentRole,
                country: vietnam,
                supplier: null,
            },
            // Moderators
            {
                uuid: uuidv4(),
                username: 'moderator',
                password: hashedPassword,
                full_name: 'Lê Văn Moderator',
                email: 'moderator@bookintour.vn',
                phone: '0903456789',
                status: 1,
                login_type: 0,
                role: moderatorRole,
                country: vietnam,
                supplier: null,
            },
            // Supplier users
            {
                uuid: uuidv4(),
                username: 'supplier1',
                password: hashedPassword,
                full_name: 'Phạm Minh Supplier',
                email: 'supplier1@viettravel.com',
                phone: '0904567890',
                status: 1,
                login_type: 0,
                role: supplierRole,
                country: vietnam,
                supplier: suppliers[0] || null,
            },
            {
                uuid: uuidv4(),
                username: 'supplier2',
                password: hashedPassword,
                full_name: 'Hoàng Thị Supplier',
                email: 'supplier2@saigontourist.vn',
                phone: '0905678901',
                status: 1,
                login_type: 0,
                role: supplierRole,
                country: vietnam,
                supplier: suppliers[1] || null,
            },
            {
                uuid: uuidv4(),
                username: 'supplier3',
                password: hashedPassword,
                full_name: 'Đỗ Văn Supplier',
                email: 'supplier3@hanoiadventure.vn',
                phone: '0906789012',
                status: 1,
                login_type: 0,
                role: supplierRole,
                country: vietnam,
                supplier: suppliers[2] || null,
            },
            // Customer users
            {
                uuid: uuidv4(),
                username: 'customer1',
                password: hashedPassword,
                full_name: 'Nguyễn Văn Customer',
                email: 'customer1@gmail.com',
                phone: '0907890123',
                status: 1,
                login_type: 0,
                role: customerRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'customer2',
                password: hashedPassword,
                full_name: 'Trần Thị Lan',
                email: 'lannt@gmail.com',
                phone: '0908901234',
                status: 1,
                login_type: 0,
                role: customerRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'customer3',
                password: hashedPassword,
                full_name: 'Lê Minh Tuấn',
                email: 'tuanlm@yahoo.com',
                phone: '0909012345',
                status: 1,
                login_type: 0,
                role: customerRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'customer4',
                password: hashedPassword,
                full_name: 'Phạm Thu Hà',
                email: 'hapt@hotmail.com',
                phone: '0910123456',
                status: 1,
                login_type: 0,
                role: customerRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'customer5',
                password: hashedPassword,
                full_name: 'Vũ Đức Anh',
                email: 'anhvd@gmail.com',
                phone: '0911234567',
                status: 1,
                login_type: 0,
                role: customerRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'customer6',
                password: hashedPassword,
                full_name: 'Hoàng Mai Linh',
                email: 'linhhm@outlook.com',
                phone: '0912345678',
                status: 1,
                login_type: 2, // Google login
                role: customerRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'customer7',
                password: hashedPassword,
                full_name: 'Đỗ Thành Long',
                email: 'longdt@gmail.com',
                phone: '0913456789',
                status: 1,
                login_type: 1, // Facebook login
                role: customerRole,
                country: vietnam,
                supplier: null,
            },
            {
                uuid: uuidv4(),
                username: 'customer8',
                password: hashedPassword,
                full_name: 'John Smith',
                email: 'john.smith@gmail.com',
                phone: '+15551234567',
                status: 1,
                login_type: 0,
                role: customerRole,
                country: usa,
                supplier: null,
            },
        ];

        for (const user of users) {
            const exists = await userRepository.findOne({ where: { username: user.username } });
            if (!exists) {
                await userRepository.save(userRepository.create(user as any));
            }
        }

        console.log('User seeded');
    }
}

