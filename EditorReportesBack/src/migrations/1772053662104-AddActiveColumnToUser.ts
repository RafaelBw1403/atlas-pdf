import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActiveColumnToUser1772053662104 implements MigrationInterface {
    name = 'AddActiveColumnToUser1772053662104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);
    }

}
