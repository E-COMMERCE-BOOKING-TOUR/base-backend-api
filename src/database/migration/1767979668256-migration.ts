import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1767979668256 implements MigrationInterface {
    name = 'Migration1767979668256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatar_url\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatar_url\``);
    }

}
