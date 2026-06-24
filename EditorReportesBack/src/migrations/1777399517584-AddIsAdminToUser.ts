import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAdminToUser1777399517584 implements MigrationInterface {
    name = 'AddIsAdminToUser1777399517584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_entitlements" DROP CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "features_id_seq" OWNED BY "features"."id"`);
        await queryRunner.query(`ALTER TABLE "features" ALTER COLUMN "id" SET DEFAULT nextval('"features_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" ADD CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_entitlements" DROP CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4"`);
        await queryRunner.query(`ALTER TABLE "features" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "features_id_seq"`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" ADD CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
