import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsVerifiedToUser1772474184562 implements MigrationInterface {
    name = 'AddIsVerifiedToUser1772474184562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_verified"`);
    }

}
