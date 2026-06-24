import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlockColumnsToUser1772469843056 implements MigrationInterface {
    name = 'AddBlockColumnsToUser1772469843056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_auth_tokens_type_enum" AS ENUM('email_verification', 'password_recovery')`);
        await queryRunner.query(`CREATE TABLE "user_auth_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token_hash" character varying(255) NOT NULL, "type" "public"."user_auth_tokens_type_enum" NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "used_at" TIMESTAMP, "attempts" integer NOT NULL DEFAULT '0', "max_attempts" integer NOT NULL DEFAULT '3', "user_id" uuid NOT NULL, CONSTRAINT "PK_e15c7c76bf967080b272104d828" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_95f6433ca9c58e30879cc5b66e" ON "user_auth_tokens" ("token_hash") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_blocked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "blocked_until" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_auth_tokens" ADD CONSTRAINT "FK_bab7def1955bd13dcc47c036c03" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_auth_tokens" DROP CONSTRAINT "FK_bab7def1955bd13dcc47c036c03"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "blocked_until"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_blocked"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95f6433ca9c58e30879cc5b66e"`);
        await queryRunner.query(`DROP TABLE "user_auth_tokens"`);
        await queryRunner.query(`DROP TYPE "public"."user_auth_tokens_type_enum"`);
    }

}
