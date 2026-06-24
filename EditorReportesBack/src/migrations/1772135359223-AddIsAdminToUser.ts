import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAdminToUser1772135359223 implements MigrationInterface {
    name = 'AddIsAdminToUser1772135359223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isAdmin"`);
    }

}
