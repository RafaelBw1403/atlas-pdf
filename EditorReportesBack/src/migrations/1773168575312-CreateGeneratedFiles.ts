import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGeneratedFiles1773168575312 implements MigrationInterface {
    name = 'CreateGeneratedFiles1773168575312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."generated_files_status_enum" AS ENUM('pending', 'completed', 'failed', 'expired')`);
        await queryRunner.query(`CREATE TABLE "generated_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying(20) NOT NULL, "original_name" character varying(255) NOT NULL, "storage_path" text NOT NULL, "status" "public"."generated_files_status_enum" NOT NULL DEFAULT 'pending', "delete_immediately" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "api_key_used" character varying, CONSTRAINT "PK_d65b0f247c14a5a49c9f747ba42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_780a1e7773c6982b38dc9a40b6" ON "generated_files" ("slug") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_780a1e7773c6982b38dc9a40b6"`);
        await queryRunner.query(`DROP TABLE "generated_files"`);
        await queryRunner.query(`DROP TYPE "public"."generated_files_status_enum"`);
    }

}
