import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766830076753 implements MigrationInterface {
    name = 'Migration1766830076753';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD \`stripe_charge_id\` varchar(255) NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` ADD \`refund_amount\` decimal(12,2) NOT NULL DEFAULT '0.00'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP COLUMN \`refund_amount\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`bookings\` DROP COLUMN \`stripe_charge_id\``,
        );
    }
}
