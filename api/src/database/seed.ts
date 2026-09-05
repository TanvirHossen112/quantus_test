import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { AppDataSource } from './data-source.js';
import { Article } from '../articles/entities/article.entity.js';
import { ObjectEntity } from '../objects/entities/object.entity.js';
import { Unit } from '../objects/enums/unit.enum.js';
import { ObjectProperties } from '../objects/interfaces/object-properties.interface.js';

interface SeedObjectDef {
  name: string;
  type: string;
  unit: Unit;
  unitPriceCents: number;
  properties: ObjectProperties;
}

interface SeedArticleDef {
  code: string;
  title: string;
  description?: string;
  children?: SeedArticleDef[];
  objects?: SeedObjectDef[];
}

// Canonical dataset from context.md — used verbatim in the README's worked
// example and in the e2e tests, so it must stay internally consistent.
// Grand total: EUR 12,617.55.
const seedData: SeedArticleDef[] = [
  {
    code: '20.',
    title: 'Masonry',
    children: [
      {
        code: '20.11.',
        title: 'Masonry — materials',
        children: [
          {
            code: '20.11.10.',
            title: 'Materials — mortar',
            objects: [
              {
                name: 'Wall W-01 exterior',
                type: 'wall',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 1450,
                properties: { length: 12.4, height: 2.7 },
              },
              {
                name: 'Wall W-02 party',
                type: 'wall',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 1450,
                properties: { length: 8.6, height: 2.7 },
              },
            ],
          },
          {
            code: '20.11.20.',
            title: 'Materials — clay brick',
            objects: [
              {
                name: 'Wall W-01 exterior',
                type: 'wall',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 6200,
                properties: { length: 12.4, height: 2.7 },
              },
              {
                name: 'Wall W-02 party',
                type: 'wall',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 6200,
                properties: { length: 8.6, height: 2.7 },
              },
            ],
          },
        ],
      },
      {
        code: '20.12.',
        title: 'Masonry — openings',
        objects: [
          {
            name: 'Door D-01',
            type: 'door',
            unit: Unit.PIECE,
            unitPriceCents: 34000,
            properties: { count: 3 },
          },
          {
            name: 'Window R-01',
            type: 'window',
            unit: Unit.PIECE,
            unitPriceCents: 41000,
            properties: { count: 5 },
          },
        ],
      },
    ],
  },
  {
    code: '30.',
    title: 'Roofing',
    // The brief gives no line-item breakdown for Roofing, only the total
    // (EUR 5,210.00). Mocked as a single 10m x 10m covering so the number
    // lands exactly on the canonical figure — see README "Assumptions".
    objects: [
      {
        name: 'Roof covering',
        type: 'roofing',
        unit: Unit.SQUARE_METER,
        unitPriceCents: 5210,
        properties: { length: 10, height: 10 },
      },
    ],
  },
];

async function seed() {
  await AppDataSource.initialize();
  await AppDataSource.query(
    'TRUNCATE TABLE objects, articles RESTART IDENTITY CASCADE',
  );

  const articlesRepo = AppDataSource.getRepository(Article);
  const objectsRepo = AppDataSource.getRepository(ObjectEntity);

  const articleRows: Partial<Article>[] = [];
  const objectRows: Partial<ObjectEntity>[] = [];

  function flatten(defs: SeedArticleDef[], parentId: string | null) {
    for (const def of defs) {
      const id = randomUUID();
      articleRows.push({
        id,
        code: def.code,
        title: def.title,
        description: def.description ?? null,
        parentId,
      });

      for (const obj of def.objects ?? []) {
        objectRows.push({
          id: randomUUID(),
          drawingUuid: randomUUID(),
          name: obj.name,
          type: obj.type,
          unit: obj.unit,
          unitPriceCents: obj.unitPriceCents,
          properties: obj.properties,
          articleId: id,
        });
      }

      if (def.children) flatten(def.children, id);
    }
  }
  flatten(seedData, null);

  console.log(`Inserting ${articleRows.length} articles...`);
  await articlesRepo.save(articlesRepo.create(articleRows));

  console.log(`Inserting ${objectRows.length} objects...`);
  await objectsRepo.save(objectsRepo.create(objectRows));

  console.log('Done.');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
