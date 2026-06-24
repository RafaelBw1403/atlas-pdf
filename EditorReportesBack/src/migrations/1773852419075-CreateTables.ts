import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1773852419075 implements MigrationInterface {
    name = 'CreateTables1773852419075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL DEFAULT 'active', "current_period_start" TIMESTAMP NOT NULL, "current_period_end" TIMESTAMP NOT NULL, "userId" uuid, "planId" uuid, CONSTRAINT "REL_fbdba4e2ac694cf8c9cecf4dc8" UNIQUE ("userId"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan_entitlements" ("id" SERIAL NOT NULL, "value" character varying NOT NULL, "planId" uuid, "featureId" integer, CONSTRAINT "PK_457e3d0a6af4aaa511844067f33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."features_data_type_enum" AS ENUM('int', 'bool', 'float')`);
        await queryRunner.query(`CREATE TABLE "features" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "description" text NOT NULL, "data_type" "public"."features_data_type_enum" NOT NULL DEFAULT 'int', CONSTRAINT "UQ_c0e1f5d0ba8027c186705d752b8" UNIQUE ("code"), CONSTRAINT "PK_5c1e336df2f4a7051e5bf08a941" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pdf_audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "generated_at" TIMESTAMP NOT NULL DEFAULT now(), "generation_time_ms" integer NOT NULL, "source_ip" character varying, "file_size_bytes" integer NOT NULL, "userId" uuid, "apiKeyId" uuid, CONSTRAINT "PK_5b541a4e4409f5c8db83ae3d4a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usage_counters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "featureCode" character varying NOT NULL, "current_usage" integer NOT NULL DEFAULT '0', "overage_usage" integer NOT NULL DEFAULT '0', "last_reset" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_fb39db314fa8fc2b6653f2f4e31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7536cba909dd7584a4640cad7d5" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" ADD CONSTRAINT "FK_b77a22e02b7e33336ea05ac35a7" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" ADD CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdf_audit_log" ADD CONSTRAINT "FK_0bcd30c1aa52f79f6720dc13f34" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdf_audit_log" ADD CONSTRAINT "FK_2954ec589216ef1cb703414613f" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usage_counters" ADD CONSTRAINT "FK_9a86ab320c252f5803fba34820d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usage_counters" DROP CONSTRAINT "FK_9a86ab320c252f5803fba34820d"`);
        await queryRunner.query(`ALTER TABLE "pdf_audit_log" DROP CONSTRAINT "FK_2954ec589216ef1cb703414613f"`);
        await queryRunner.query(`ALTER TABLE "pdf_audit_log" DROP CONSTRAINT "FK_0bcd30c1aa52f79f6720dc13f34"`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" DROP CONSTRAINT "FK_2fa5d0ede7adc3e27adcf88fbc4"`);
        await queryRunner.query(`ALTER TABLE "plan_entitlements" DROP CONSTRAINT "FK_b77a22e02b7e33336ea05ac35a7"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7536cba909dd7584a4640cad7d5"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP TABLE "usage_counters"`);
        await queryRunner.query(`DROP TABLE "pdf_audit_log"`);
        await queryRunner.query(`DROP TABLE "features"`);
        await queryRunner.query(`DROP TYPE "public"."features_data_type_enum"`);
        await queryRunner.query(`DROP TABLE "plan_entitlements"`);
        await queryRunner.query(`DROP TABLE "plans"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
    }

}
