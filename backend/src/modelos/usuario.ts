import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Categoria } from "./categoria";
import { Transacao } from "./transacao";

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  nomeCompleto!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  senha!: string;

  @CreateDateColumn()
  criadoEm!: Date;

  @OneToMany(() => Transacao, (transacao) => transacao.usuario)
  transacoes!: Transacao[];

  @OneToMany(() => Categoria, (categoria) => categoria.usuario)
  categorias!: Categoria[];
}
