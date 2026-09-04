import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Article } from '../articles/entities/article.entity.js';
import { ObjectEntity } from '../objects/entities/object.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'quantus',
  password: process.env.DB_PASSWORD ?? 'quantusdevsecret__',
  database: process.env.DB_NAME ?? 'quantus',
  entities: [Article, ObjectEntity],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
