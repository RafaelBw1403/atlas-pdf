import { MigrationInterface, QueryRunner } from "typeorm";

export class NewFieldsTable1773951725373 implements MigrationInterface {
    name = 'NewFieldsTable1773951725373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "generated_files" DROP COLUMN "api_key_used"`);
        await queryRunner.query(`ALTER TABLE "generated_files" ADD "api_key_id" uuid`);
        await queryRunner.query(`ALTER TABLE "generated_files" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "pdf_audit_log" ADD "document_id" character varying`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" DROP CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "features_id_seq" OWNED BY "features"."id"`);
        await queryRunner.query(`ALTER TABLE "features" ALTER COLUMN "id" SET DEFAULT nextval('"features_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "features" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "generated_files" ADD CONSTRAINT "FK_a6ae981e8bf1325243ae80760be" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "generated_files" ADD CONSTRAINT "FK_6ec2d804ebded8e27600b553503" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" ADD CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_entitlements" DROP CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4"`);
        await queryRunner.query(`ALTER TABLE "generated_files" DROP CONSTRAINT "FK_6ec2d804ebded8e27600b553503"`);
        await queryRunner.query(`ALTER TABLE "generated_files" DROP CONSTRAINT "FK_a6ae981e8bf1325243ae80760be"`);
        await queryRunner.query(`ALTER TABLE "features" ALTER COLUMN "id" SET DEFAULT nextval('features_id_seq2')`);
        await queryRunner.query(`ALTER TABLE "features" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "features_id_seq"`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" ADD CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdf_audit_log" DROP COLUMN "document_id"`);
        await queryRunner.query(`ALTER TABLE "generated_files" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "generated_files" DROP COLUMN "api_key_id"`);
        await queryRunner.query(`ALTER TABLE "generated_files" ADD "api_key_used" character varying`);
    }

}
