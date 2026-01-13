import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768308900990 implements MigrationInterface {
    name = 'Migration1768308900990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_infomations\` ADD \`vnpay_transaction_no\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_infomations\` ADD \`vnpay_bank_code\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment_infomations\` ADD \`vnpay_pay_date\` varchar(20) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment_infomations\` DROP COLUMN \`vnpay_pay_date\``);
        await queryRunner.query(`ALTER TABLE \`payment_infomations\` DROP COLUMN \`vnpay_bank_code\``);
        await queryRunner.query(`ALTER TABLE \`payment_infomations\` DROP COLUMN \`vnpay_transaction_no\``);
    }

}
