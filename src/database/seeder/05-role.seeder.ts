import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { RoleEntity } from '@/module/user/entity/role.entity';
import { PermissionEntity } from '@/module/user/entity/permission.entity';

export default class RoleSeeder implements Seeder {
    async run(dataSource: DataSource): Promise<void> {
        const roleRepository = dataSource.getRepository(RoleEntity);
        const permissionRepository = dataSource.getRepository(PermissionEntity);

        // Get all permissions
        const allPermissions = await permissionRepository.find();

        // Admin role - all permissions
        let adminRole = await roleRepository.findOne({
            where: { name: 'admin' },
        });
        if (!adminRole) {
            adminRole = roleRepository.create({
                name: 'admin',
                desciption: 'Quản trị viên hệ thống - có tất cả quyền',
                permissions: allPermissions,
            });
            await roleRepository.save(adminRole);
        }

        // Supplier role - tour and booking management
        let supplierRole = await roleRepository.findOne({
            where: { name: 'supplier' },
        });
        if (!supplierRole) {
            const supplierPermissions = allPermissions.filter(
                (p) =>
                    p.permission_name.startsWith('tour:') ||
                    p.permission_name.startsWith('booking:') ||
                    p.permission_name === 'review:read' ||
                    p.permission_name === 'report:read',
            );
            supplierRole = roleRepository.create({
                name: 'supplier',
                desciption: 'Nhà cung cấp tour - quản lý tour và đơn đặt',
                permissions: supplierPermissions,
            });
            await roleRepository.save(supplierRole);
        }

        // Customer role - basic user
        let customerRole = await roleRepository.findOne({
            where: { name: 'customer' },
        });
        if (!customerRole) {
            const customerPermissions = allPermissions.filter(
                (p) =>
                    p.permission_name === 'tour:read' ||
                    p.permission_name === 'booking:read' ||
                    p.permission_name === 'booking:create' ||
                    p.permission_name === 'booking:cancel' ||
                    p.permission_name === 'article:read' ||
                    p.permission_name === 'review:read' ||
                    p.permission_name === 'review:create' ||
                    p.permission_name === 'payment:read',
            );
            customerRole = roleRepository.create({
                name: 'customer',
                desciption: 'Khách hàng - đặt tour và viết đánh giá',
                permissions: customerPermissions,
            });
            await roleRepository.save(customerRole);
        }

        // Content Manager role - article management
        let contentRole = await roleRepository.findOne({
            where: { name: 'content_manager' },
        });
        if (!contentRole) {
            const contentPermissions = allPermissions.filter(
                (p) =>
                    p.permission_name.startsWith('article:') ||
                    p.permission_name.startsWith('review:'),
            );
            contentRole = roleRepository.create({
                name: 'content_manager',
                desciption: 'Quản lý nội dung - quản lý bài viết và đánh giá',
                permissions: contentPermissions,
            });
            await roleRepository.save(contentRole);
        }

        // Moderator role - review and article approval
        let moderatorRole = await roleRepository.findOne({
            where: { name: 'moderator' },
        });
        if (!moderatorRole) {
            const moderatorPermissions = allPermissions.filter(
                (p) =>
                    p.permission_name === 'article:read' ||
                    p.permission_name === 'article:publish' ||
                    p.permission_name === 'review:read' ||
                    p.permission_name === 'review:approve' ||
                    p.permission_name === 'review:reject',
            );
            moderatorRole = roleRepository.create({
                name: 'moderator',
                desciption: 'Người kiểm duyệt - phê duyệt bài viết và đánh giá',
                permissions: moderatorPermissions,
            });
            await roleRepository.save(moderatorRole);
        }

        console.log('Role seeded');
    }
}
