import { MigrationInterface, QueryRunner } from "typeorm";

export class RestoreFeaturesTable1773856048097 implements MigrationInterface {
    name = 'RestoreFeaturesTable1773856048097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "features" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "description" text NOT NULL, "data_type" "public"."features_data_type_enum" NOT NULL DEFAULT 'int', CONSTRAINT "UQ_c0e1f5d0ba8027c186705d752b8" UNIQUE ("code"), CONSTRAINT "PK_5c1e336df2f4a7051e5bf08a941" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" ADD CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_entitlements" DROP CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850"`);
        await queryRunner.query(`DROP TABLE "features"`);
    }

}
