import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { PermissionEntity } from '@/module/user/entity/permission.entity';

export default class PermissionSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(PermissionEntity);

        const permissions = [
            // User permissions
            {
                permission_name: 'user:read',
                description: 'Xem thông tin người dùng',
            },
            {
                permission_name: 'user:create',
                description: 'Tạo người dùng mới',
            },
            {
                permission_name: 'user:update',
                description: 'Cập nhật thông tin người dùng',
            },
            { permission_name: 'user:delete', description: 'Xóa người dùng' },

            // Tour permissions
            { permission_name: 'tour:read', description: 'Xem thông tin tour' },
            { permission_name: 'tour:create', description: 'Tạo tour mới' },
            {
                permission_name: 'tour:update',
                description: 'Cập nhật thông tin tour',
            },
            { permission_name: 'tour:delete', description: 'Xóa tour' },
            { permission_name: 'tour:publish', description: 'Công bố tour' },

            // Booking permissions
            {
                permission_name: 'booking:read',
                description: 'Xem đơn đặt tour',
            },
            {
                permission_name: 'booking:create',
                description: 'Tạo đơn đặt tour',
            },
            {
                permission_name: 'booking:update',
                description: 'Cập nhật đơn đặt tour',
            },
            {
                permission_name: 'booking:cancel',
                description: 'Hủy đơn đặt tour',
            },
            {
                permission_name: 'booking:confirm',
                description: 'Xác nhận đơn đặt tour',
            },

            // Article permissions
            { permission_name: 'article:read', description: 'Xem bài viết' },
            { permission_name: 'article:create', description: 'Tạo bài viết' },
            {
                permission_name: 'article:update',
                description: 'Cập nhật bài viết',
            },
            { permission_name: 'article:delete', description: 'Xóa bài viết' },
            {
                permission_name: 'article:publish',
                description: 'Công bố bài viết',
            },

            // Review permissions
            { permission_name: 'review:read', description: 'Xem đánh giá' },
            { permission_name: 'review:create', description: 'Tạo đánh giá' },
            {
                permission_name: 'review:approve',
                description: 'Phê duyệt đánh giá',
            },
            {
                permission_name: 'review:reject',
                description: 'Từ chối đánh giá',
            },
            { permission_name: 'review:delete', description: 'Xóa đánh giá' },

            // Payment permissions
            {
                permission_name: 'payment:read',
                description: 'Xem thông tin thanh toán',
            },
            {
                permission_name: 'payment:process',
                description: 'Xử lý thanh toán',
            },
            { permission_name: 'payment:refund', description: 'Hoàn tiền' },

            // Report permissions
            { permission_name: 'report:read', description: 'Xem báo cáo' },
            { permission_name: 'report:export', description: 'Xuất báo cáo' },

            // System permissions
            {
                permission_name: 'system:admin',
                description: 'Quản trị hệ thống',
            },
            {
                permission_name: 'system:config',
                description: 'Cấu hình hệ thống',
            },
        ];

        for (const permission of permissions) {
            const exists = await repository.findOne({
                where: { permission_name: permission.permission_name },
            });
            if (!exists) {
                await repository.save(repository.create(permission));
            }
        }

        console.log('Permission seeded');
    }
}
