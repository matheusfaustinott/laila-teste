import "reflect-metadata";
import { DataSource } from "typeorm";
import { Categoria, Transacao, Usuario } from "../modelos";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "admin",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_DATABASE || "laila",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [Usuario, Categoria, Transacao],
  migrations: [__dirname + "/migrations/*.{js,ts}"],
});
