import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766832201834 implements MigrationInterface {
    name = 'Migration1766832201834';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`bookings\` CHANGE \`stripe_charge_id\` \`cancel_reason\` varchar(255) NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`payment_infomations\` ADD \`stripe_charge_id\` varchar(255) NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP COLUMN \`cancel_reason\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD \`cancel_reason\` text NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP COLUMN \`cancel_reason\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD \`cancel_reason\` varchar(255) NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`payment_infomations\` DROP COLUMN \`stripe_charge_id\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` CHANGE \`cancel_reason\` \`stripe_charge_id\` varchar(255) NULL`,
        );
    }
}
