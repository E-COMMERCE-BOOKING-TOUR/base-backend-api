import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766943475670 implements MigrationInterface {
    name = 'Migration1766943475670';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`tour_categories\` ADD \`vector\` json NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` ADD \`insight_data\` text NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`tours\` ADD \`vector\` json NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tours\` DROP COLUMN \`vector\``);
        await queryRunner.query(
            `ALTER TABLE \`tours\` DROP COLUMN \`insight_data\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`tour_categories\` DROP COLUMN \`vector\``,
        );
    }
}
