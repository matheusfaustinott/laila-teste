import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1759345557241 implements MigrationInterface {
    name = 'CreateTables1759345557241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transacoes_tipo_enum" AS ENUM('receita', 'despesa')`);
        await queryRunner.query(`CREATE TABLE "transacoes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying NOT NULL, "descricao" character varying, "valor" numeric(10,2) NOT NULL, "tipo" "public"."transacoes_tipo_enum" NOT NULL, "data" date NOT NULL, "criadoEm" TIMESTAMP NOT NULL DEFAULT now(), "usuarioId" uuid NOT NULL, "categoriaId" uuid, CONSTRAINT "PK_19e05c3d8e87df1545fcc6c8505" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nomeCompleto" character varying NOT NULL, "email" character varying NOT NULL, "senha" character varying NOT NULL, "criadoEm" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categorias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "descricao" character varying, "criadoEm" TIMESTAMP NOT NULL DEFAULT now(), "usuarioId" uuid NOT NULL, CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transacoes" ADD CONSTRAINT "FK_2289a6482379b597f541c8aa34b" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transacoes" ADD CONSTRAINT "FK_743a7ed8e36911535a6dd0f7da9" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categorias" ADD CONSTRAINT "FK_46f3c474e693f31c34e65d0412e" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categorias" DROP CONSTRAINT "FK_46f3c474e693f31c34e65d0412e"`);
        await queryRunner.query(`ALTER TABLE "transacoes" DROP CONSTRAINT "FK_743a7ed8e36911535a6dd0f7da9"`);
        await queryRunner.query(`ALTER TABLE "transacoes" DROP CONSTRAINT "FK_2289a6482379b597f541c8aa34b"`);
        await queryRunner.query(`DROP TABLE "categorias"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "transacoes"`);
        await queryRunner.query(`DROP TYPE "public"."transacoes_tipo_enum"`);
    }

}
