import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncRolePermissions1766662747554 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Function to sync permissions for a role
        const syncRole = async (roleName: string, permissionPatterns: string[], isLiteral: boolean = false) => {
            const roles = await queryRunner.query(`SELECT id FROM roles WHERE name = ?`, [roleName]);
            if (roles.length === 0) return;
            const roleId = roles[0].id;

            // Clear existing permissions for this role
            await queryRunner.query(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);

            // Build permission query
            let permissions: any[] = [];
            if (isLiteral) {
                const placeholders = permissionPatterns.map(() => '?').join(',');
                permissions = await queryRunner.query(
                    `SELECT id FROM permissions WHERE permission_name IN (${placeholders})`,
                    permissionPatterns
                );
            } else {
                const conditions = permissionPatterns.map(() => `permission_name LIKE ?`).join(' OR ');
                permissions = await queryRunner.query(
                    `SELECT id FROM permissions WHERE ${conditions}`,
                    permissionPatterns
                );
            }

            if (permissions.length > 0) {
                const values = permissions.map((p: any) => `(${roleId}, ${p.id})`).join(',');
                await queryRunner.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`);
            }
        };

        // 1. Admin - All permissions
        const allPermissionsResult = await queryRunner.query(`SELECT id FROM permissions`);
        const adminRoles = await queryRunner.query(`SELECT id FROM roles WHERE name = 'admin'`);
        if (adminRoles.length >= 1) {
            const adminId = adminRoles[0].id;
            await queryRunner.query(`DELETE FROM role_permissions WHERE role_id = ?`, [adminId]);
            if (allPermissionsResult.length > 0) {
                const adminValues = allPermissionsResult.map((p: any) => `(${adminId}, ${p.id})`).join(',');
                await queryRunner.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${adminValues}`);
            }
        }

        // 2. Supplier
        await syncRole('supplier', ['tour:%', 'booking:%', 'review:read', 'report:read']);

        // 3. Customer
        await syncRole('customer', [
            'tour:read', 'booking:read', 'booking:create', 'booking:cancel',
            'article:read', 'review:read', 'review:create', 'payment:read'
        ], true);

        // 4. Content Manager
        await syncRole('content_manager', ['article:%', 'review:%']);

        // 5. Moderator
        await syncRole('moderator', [
            'article:read', 'article:publish', 'review:read', 'review:approve', 'review:reject'
        ], true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Data migrations usually don't need a specific rollback in this context.
    }
}
