import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectEntity } from '../../objects/entities/object.entity.js';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  code: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Article, (article) => article.children, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Article | null;

  @OneToMany(() => Article, (article) => article.parent)
  children: Article[];

  @OneToMany(() => ObjectEntity, (object) => object.article)
  objects: ObjectEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
