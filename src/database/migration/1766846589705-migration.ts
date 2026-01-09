import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766846589705 implements MigrationInterface {
    name = 'Migration1766846589705';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD \`reset_password_token\` varchar(255) NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` ADD \`reset_password_token_expires\` timestamp NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP COLUMN \`reset_password_token_expires\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`users\` DROP COLUMN \`reset_password_token\``,
        );
    }
}
