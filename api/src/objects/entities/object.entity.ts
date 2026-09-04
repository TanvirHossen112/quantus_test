import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Article } from '../../articles/entities/article.entity.js';
import { Unit } from '../enums/unit.enum.js';
import type { ObjectProperties } from '../interfaces/object-properties.interface.js';

@Entity('objects')
export class ObjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'drawing_uuid', type: 'uuid' })
  drawingUuid: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ type: 'enum', enum: Unit })
  unit: Unit;

  @Column({ name: 'unit_price_cents', type: 'integer' })
  unitPriceCents: number;

  @Column({ type: 'jsonb', default: {} })
  properties: ObjectProperties;

  @Index()
  @Column({ name: 'article_id', type: 'uuid' })
  articleId: string;

  @ManyToOne('Article', (article: Article) => article.objects, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
