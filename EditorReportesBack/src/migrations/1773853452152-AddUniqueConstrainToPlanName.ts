import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstrainToPlanName1773853452152 implements MigrationInterface {
    name = 'AddUniqueConstrainToPlanName1773853452152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850"`);
    }

}
