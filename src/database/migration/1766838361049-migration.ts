import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766838361049 implements MigrationInterface {
    name = 'Migration1766838361049';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD \`is_supplier_notified\` tinyint NOT NULL DEFAULT 0`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD \`supplier_notified_at\` datetime NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` CHANGE \`status\` \`status\` enum ('pending_info', 'pending_payment', 'pending_confirm', 'waiting_supplier', 'pending', 'confirmed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`bookings\` CHANGE \`status\` \`status\` enum ('pending_info', 'pending_payment', 'pending_confirm', 'pending', 'confirmed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP COLUMN \`supplier_notified_at\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP COLUMN \`is_supplier_notified\``,
        );
    }
}
