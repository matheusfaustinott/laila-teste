import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Categoria } from "./categoria";
import { Usuario } from "./usuario";

@Entity("transacoes")
export class Transacao {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  titulo!: string;

  @Column({ nullable: true })
  descricao?: string;

  @Column("decimal", { precision: 10, scale: 2 })
  valor!: number;

  @Column({ type: "enum", enum: ["receita", "despesa"] })
  tipo!: "receita" | "despesa";

  @Column({ type: "date" })
  data!: Date;

  @CreateDateColumn()
  criadoEm!: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.transacoes, {
    nullable: false,
  })
  @JoinColumn({ name: "usuarioId" })
  usuario!: Usuario;

  @ManyToOne(() => Categoria, (categoria) => categoria.transacoes, {
    nullable: true,
  })
  @JoinColumn({ name: "categoriaId" })
  categoria?: Categoria;
}
