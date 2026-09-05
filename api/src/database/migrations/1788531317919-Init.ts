import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1788531317919 implements MigrationInterface {
  name = 'Init1788531317919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."objects_unit_enum" AS ENUM('m', 'm2', 'm3', 'kg', 'piece')`,
    );
    await queryRunner.query(
      `CREATE TABLE "objects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "drawing_uuid" uuid NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "unit" "public"."objects_unit_enum" NOT NULL, "unit_price_cents" integer NOT NULL, "properties" jsonb NOT NULL DEFAULT '{}', "article_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_87b86663af0123508099f0d970a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_77ee99acaa506c70a76a93b729" ON "objects"  ("drawing_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_289bf0514d7cf5cfaf9efe4bb8" ON "objects"  ("article_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "parent_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fad4aa1ac23fa62b93c2320b80" ON "articles"  ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f01347461fa95fe62af2223700" ON "articles"  ("parent_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "objects" ADD CONSTRAINT "FK_289bf0514d7cf5cfaf9efe4bb8f" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_f01347461fa95fe62af2223700b" FOREIGN KEY ("parent_id") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_f01347461fa95fe62af2223700b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "objects" DROP CONSTRAINT "FK_289bf0514d7cf5cfaf9efe4bb8f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f01347461fa95fe62af2223700"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fad4aa1ac23fa62b93c2320b80"`,
    );
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_289bf0514d7cf5cfaf9efe4bb8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77ee99acaa506c70a76a93b729"`,
    );
    await queryRunner.query(`DROP TABLE "objects"`);
    await queryRunner.query(`DROP TYPE "public"."objects_unit_enum"`);
  }
}
