import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1696341000000 implements MigrationInterface {
  name = "CreateTables1696341000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`CREATE TABLE "usuarios" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "nomeCompleto" character varying NOT NULL,
            "email" character varying NOT NULL,
            "senha" character varying NOT NULL,
            "criadoEm" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_email_usuario" UNIQUE ("email"),
            CONSTRAINT "PK_usuario" PRIMARY KEY ("id")
        )`);

    await queryRunner.query(`CREATE TABLE "categorias" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "nome" character varying NOT NULL,
            "descricao" character varying,
            "criadoEm" TIMESTAMP NOT NULL DEFAULT now(),
            "usuarioId" uuid NOT NULL,
            CONSTRAINT "PK_categoria" PRIMARY KEY ("id"),
            CONSTRAINT "FK_categoria_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        )`);

    await queryRunner.query(`CREATE TABLE "transacoes" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "titulo" character varying NOT NULL,
            "descricao" character varying,
            "valor" numeric(10,2) NOT NULL,
            "tipo" character varying NOT NULL CHECK ("tipo" IN ('receita', 'despesa')),
            "data" date NOT NULL,
            "criadoEm" TIMESTAMP NOT NULL DEFAULT now(),
            "usuarioId" uuid NOT NULL,
            "categoriaId" uuid NOT NULL,
            CONSTRAINT "PK_transacao" PRIMARY KEY ("id"),
            CONSTRAINT "FK_transacao_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT "FK_transacao_categoria" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        )`);

    await queryRunner.query(
      `CREATE INDEX "IDX_usuario_email" ON "usuarios" ("email")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categoria_usuario" ON "categorias" ("usuarioId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transacao_usuario" ON "transacoes" ("usuarioId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transacao_categoria" ON "transacoes" ("categoriaId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transacao_data" ON "transacoes" ("data")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_transacao_tipo" ON "transacoes" ("tipo")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_transacao_tipo"`);
    await queryRunner.query(`DROP INDEX "IDX_transacao_data"`);
    await queryRunner.query(`DROP INDEX "IDX_transacao_categoria"`);
    await queryRunner.query(`DROP INDEX "IDX_transacao_usuario"`);
    await queryRunner.query(`DROP INDEX "IDX_categoria_usuario"`);
    await queryRunner.query(`DROP INDEX "IDX_usuario_email"`);

    await queryRunner.query(`DROP TABLE "transacoes"`);
    await queryRunner.query(`DROP TABLE "categorias"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
  }
}
