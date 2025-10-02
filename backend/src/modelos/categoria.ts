import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Transacao } from "./transacao";
import { Usuario } from "./usuario";

@Entity("categorias")
export class Categoria {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao?: string;

  @CreateDateColumn()
  criadoEm!: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.categorias, {
    nullable: false,
  })
  @JoinColumn({ name: "usuarioId" })
  usuario!: Usuario;

  @OneToMany(() => Transacao, (transacao) => transacao.categoria)
  transacoes!: Transacao[];
}
