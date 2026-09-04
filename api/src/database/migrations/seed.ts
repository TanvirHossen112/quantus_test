import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { AppDataSource } from './data-source.js';
import { Article } from '../../articles/entities/article.entity.js';
import { ObjectEntity } from '../../objects/entities/object.entity.js';
import { Unit } from '../../objects/enums/unit.enum.js';
import { ObjectProperties } from '../../objects/interfaces/object-properties.interface.js';

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

function directionalWalls(
  baseName: string,
  type: string,
  unit: Unit.SQUARE_METER | Unit.CUBIC_METER,
  unitPriceCents: number,
  lengths: [number, number, number, number, number],
  height: number,
  thickness?: number,
): SeedObjectDef[] {
  const sides = ['ACHTER', 'HOR', 'LINKS', 'RECHTS', 'VOOR'];
  return sides.map((side, i) => ({
    name: `${baseName} - ${side}`,
    type,
    unit,
    unitPriceCents,
    properties:
      unit === Unit.CUBIC_METER
        ? { length: lengths[i], height, thickness: thickness ?? 0.2 }
        : { length: lengths[i], height },
  }));
}

const seedData: SeedArticleDef[] = [
  {
    code: '10.',
    title: 'Grondwerken',
    description: 'Alle grondwerken voor de realisatie van de bouwput en funderingssleuven.',
    children: [
      {
        code: '10.10.',
        title: 'Uitgraving',
        children: [
          {
            code: '10.10.10.',
            title: 'Uitgraving bouwput',
            objects: [
              {
                name: 'Uitgraving bouwput - algemeen',
                type: 'earthwork',
                unit: Unit.CUBIC_METER,
                unitPriceCents: 1200,
                properties: { length: 18, height: 2.2, thickness: 12 },
              },
            ],
          },
          {
            code: '10.10.20.',
            title: 'Uitgraving funderingssleuven',
            objects: [
              {
                name: 'Uitgraving sleuf - buitengevel',
                type: 'earthwork',
                unit: Unit.CUBIC_METER,
                unitPriceCents: 1450,
                properties: { length: 42, height: 0.8, thickness: 0.6 },
              },
            ],
          },
        ],
      },
      {
        code: '10.20.',
        title: 'Aanvullingen',
        children: [
          {
            code: '10.20.10.',
            title: 'Aanvulling met gestabiliseerd zand',
            objects: [
              {
                name: 'Aanvulling gestabiliseerd zand',
                type: 'earthwork',
                unit: Unit.CUBIC_METER,
                unitPriceCents: 2800,
                properties: { length: 18, height: 0.3, thickness: 12 },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: '12.',
    title: 'Funderingen op staal',
    children: [
      {
        code: '12.10.',
        title: 'Funderingszolen en -stroken - algemeen',
        children: [
          {
            code: '12.11.',
            title: 'Funderingszolen en -stroken - ongewapend beton',
            objects: directionalWalls(
              'ZOOL',
              'foundation-strip',
              Unit.CUBIC_METER,
              20000,
              [1.451, 1.451, 4.144, 4.144, 2.159],
              0.5,
              0.6,
            ),
          },
        ],
      },
      {
        code: '12.20.',
        title: 'Funderingsplaat',
        children: [
          {
            code: '12.21.',
            title: 'Funderingsplaat - gewapend beton',
            objects: [
              {
                name: 'Funderingsplaat - gewapend beton',
                type: 'foundation-slab',
                unit: Unit.CUBIC_METER,
                unitPriceCents: 24500,
                properties: { length: 16.5, height: 10.2, thickness: 0.25 },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: '14.',
    title: 'Ondergrondse wanden',
    children: [
      {
        code: '14.10.',
        title: 'Funderingswanden - algemeen',
        children: [
          {
            code: '14.12.',
            title: 'Funderingswanden - metselwerk',
            children: [
              {
                code: '14.12.10.',
                title: 'Funderingswanden - metselwerk/betonblokken - muurdikte 39 cm',
                objects: directionalWalls(
                  'FUND',
                  'foundation-wall',
                  Unit.SQUARE_METER,
                  5400,
                  [1.581, 0, 1.581, 0.782, 0],
                  2.4,
                ).filter((o) => (o.properties.length ?? 0) > 0),
              },
            ],
          },
        ],
      },
      {
        code: '14.40.',
        title: 'Waterdichting ondergrondse wanden - algemeen',
        children: [
          {
            code: '14.43.',
            title: 'Waterdichting ondergrondse wanden - bitumenemulsie',
            objects: directionalWalls(
              'FUND',
              'waterproofing',
              Unit.SQUARE_METER,
              4000,
              [1.895, 1.895, 10.715, 10.894, 3.74],
              2.4,
            ),
          },
        ],
      },
    ],
  },
  {
    code: '17.',
    title: 'Ondergrondse leidingen',
    description:
      'Alle ondergrondse leidingen voor de afvoer van afvalwater en regenwater, inclusief hulpstukken en aansluitingen op de riolering.',
    children: [
      {
        code: '17.10.',
        title: 'Rioolbuizen - algemeen',
        children: [
          {
            code: '17.11.',
            title: 'Rioolbuizen - beton',
            children: [
              {
                code: '17.11.10.',
                title: 'Rioolbuizen - beton ongewapend - diam 200/300',
                objects: [
                  {
                    name: 'Rioolbuis DN200 - regenwaterafvoer',
                    type: 'pipe',
                    unit: Unit.METER,
                    unitPriceCents: 3800,
                    properties: { length: 24.5 },
                  },
                  {
                    name: 'Rioolbuis DN300 - vuilwaterafvoer',
                    type: 'pipe',
                    unit: Unit.METER,
                    unitPriceCents: 5200,
                    properties: { length: 18.2 },
                  },
                ],
              },
              {
                code: '17.11.20.',
                title: 'Rioolbuizen - beton gewapend - diam 400/500',
                objects: [
                  {
                    name: 'Rioolbuis DN400 - hoofdcollector',
                    type: 'pipe',
                    unit: Unit.METER,
                    unitPriceCents: 7400,
                    properties: { length: 12.8 },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: '20.',
    title: 'Ruwbouw metselwerk',
    children: [
      {
        code: '20.11.',
        title: 'Metselwerk - materialen',
        children: [
          {
            code: '20.11.10.',
            title: 'Materialen - mortel',
            objects: [
              {
                name: 'Wall W-01 exterior',
                type: 'wall',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 1450,
                properties: { length: 12.4, height: 2.7 },
              },
              {
                name: 'Wall W-02 party (mortar)',
                type: 'wall',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 1450,
                properties: { length: 8.6, height: 2.7 },
              },
            ],
          },
          {
            code: '20.11.20.',
            title: 'Materialen - gebakken steen',
            objects: [
              {
                name: 'Wall W-01 exterior (brick)',
                type: 'wall',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 6200,
                properties: { length: 12.4, height: 2.7 },
              },
              {
                name: 'Wall W-02 party (brick)',
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
        title: 'Metselwerk - openingen',
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
    code: '16.',
    title: 'Isolatie',
    children: [
      {
        code: '16.20.',
        title: 'Perimeterisolatie - algemeen',
        children: [
          {
            code: '16.21.',
            title: 'Perimeterisolatie - XPS',
            children: [
              {
                code: '16.21.10.',
                title: 'Perimeterisolatie - XPS/10 cm',
                objects: [
                  {
                    name: 'XPS-isolatie 10cm - kelderwand',
                    type: 'insulation',
                    unit: Unit.SQUARE_METER,
                    unitPriceCents: 2450,
                    properties: { length: 22, height: 2.4 },
                  },
                ],
              },
              {
                code: '16.21.20.',
                title: 'Perimeterisolatie - XPS/12 cm',
                objects: [
                  {
                    name: 'XPS-isolatie 12cm - vloerplaat',
                    type: 'insulation',
                    unit: Unit.SQUARE_METER,
                    unitPriceCents: 2900,
                    properties: { length: 16.5, height: 10.2 },
                  },
                ],
              },
            ],
          },
          {
            code: '16.22.',
            title: 'Perimeterisolatie - PUR of PIR',
            children: [
              {
                code: '16.22.10.',
                title: 'Perimeterisolatie - PUR of PIR/10 cm',
                objects: [
                  {
                    name: 'PIR-isolatie 10cm - plat dak',
                    type: 'insulation',
                    unit: Unit.SQUARE_METER,
                    unitPriceCents: 3600,
                    properties: { length: 14, height: 9.5 },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: '30.',
    title: 'Dakwerken',
    children: [
      {
        code: '30.10.',
        title: 'Dakbedekking - algemeen',
        children: [
          {
            code: '30.11.',
            title: 'Dakbedekking - EPDM',
            objects: [
              {
                name: 'EPDM-dakbedekking - hoofdvolume',
                type: 'roofing',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 4800,
                properties: { length: 14, height: 9.5 },
              },
              {
                name: 'EPDM-dakbedekking - uitbouw',
                type: 'roofing',
                unit: Unit.SQUARE_METER,
                unitPriceCents: 4800,
                properties: { length: 5.2, height: 3.8 },
              },
            ],
          },
        ],
      },
      {
        code: '30.20.',
        title: 'Dakgoten en afvoeren',
        objects: [
          {
            name: 'Zinken dakgoot',
            type: 'gutter',
            unit: Unit.METER,
            unitPriceCents: 5600,
            properties: { length: 28.4 },
          },
          {
            name: 'Regenwaterafvoerbuis',
            type: 'downspout',
            unit: Unit.PIECE,
            unitPriceCents: 12000,
            properties: { count: 4 },
          },
        ],
      },
    ],
  },
  {
    code: '33.',
    title: 'Buitenschrijnwerk',
    children: [
      {
        code: '33.10.',
        title: 'Buitenschrijnwerk - aluminium ramen',
        objects: [
          {
            name: 'Aluminium raam - gelijkvloers',
            type: 'window',
            unit: Unit.PIECE,
            unitPriceCents: 68000,
            properties: { count: 6 },
          },
          {
            name: 'Aluminium raam - verdieping',
            type: 'window',
            unit: Unit.PIECE,
            unitPriceCents: 54000,
            properties: { count: 5 },
          },
        ],
      },
      {
        code: '33.20.',
        title: 'Buitendeuren',
        objects: [
          {
            name: 'Voordeur - aluminium',
            type: 'door',
            unit: Unit.PIECE,
            unitPriceCents: 185000,
            properties: { count: 1 },
          },
          {
            name: 'Terrasdeur - schuifraam',
            type: 'door',
            unit: Unit.PIECE,
            unitPriceCents: 320000,
            properties: { count: 1 },
          },
        ],
      },
    ],
  },
  {
    code: '40.',
    title: 'Elektriciteit',
    children: [
      {
        code: '40.10.',
        title: 'Elektrische leidingen',
        objects: [
          {
            name: 'Elektrische leiding - algemeen circuit',
            type: 'electrical-wiring',
            unit: Unit.METER,
            unitPriceCents: 850,
            properties: { length: 240 },
          },
        ],
      },
      {
        code: '40.20.',
        title: 'Stopcontacten en schakelaars',
        objects: [
          {
            name: 'Stopcontact - dubbel',
            type: 'electrical-outlet',
            unit: Unit.PIECE,
            unitPriceCents: 2400,
            properties: { count: 32 },
          },
          {
            name: 'Lichtschakelaar',
            type: 'electrical-switch',
            unit: Unit.PIECE,
            unitPriceCents: 1800,
            properties: { count: 18 },
          },
        ],
      },
    ],
  },
  {
    code: '42.',
    title: 'Sanitair en HVAC',
    children: [
      {
        code: '42.10.',
        title: 'Sanitaire toestellen',
        objects: [
          {
            name: 'Toilet - hangend',
            type: 'sanitary',
            unit: Unit.PIECE,
            unitPriceCents: 42000,
            properties: { count: 3 },
          },
          {
            name: 'Wastafel',
            type: 'sanitary',
            unit: Unit.PIECE,
            unitPriceCents: 28000,
            properties: { count: 4 },
          },
        ],
      },
      {
        code: '42.20.',
        title: 'Verwarmingsinstallatie',
        objects: [
          {
            name: 'Warmtepomp - lucht/water',
            type: 'hvac',
            unit: Unit.PIECE,
            unitPriceCents: 950000,
            properties: { count: 1 },
          },
          {
            name: 'Radiator - paneelmodel',
            type: 'hvac',
            unit: Unit.PIECE,
            unitPriceCents: 24000,
            properties: { count: 9 },
          },
        ],
      },
    ],
  },
  {
    code: '50.',
    title: 'Afwerking',
    children: [
      {
        code: '50.10.',
        title: 'Vloerbekleding',
        objects: [
          {
            name: 'Parket - gelijkvloers',
            type: 'flooring',
            unit: Unit.SQUARE_METER,
            unitPriceCents: 5800,
            properties: { length: 14, height: 9.5 },
          },
          {
            name: 'Tegelvloer - natte ruimtes',
            type: 'flooring',
            unit: Unit.SQUARE_METER,
            unitPriceCents: 4200,
            properties: { length: 6.2, height: 4.8 },
          },
        ],
      },
      {
        code: '50.20.',
        title: 'Schilderwerken',
        objects: [
          {
            name: 'Schilderwerk binnenmuren - algemeen',
            type: 'painting',
            unit: Unit.SQUARE_METER,
            unitPriceCents: 1200,
            properties: { length: 48, height: 2.5 },
          },
        ],
      },
    ],
  },
];

async function seed() {
  
  await AppDataSource.initialize();
  await AppDataSource.query('TRUNCATE TABLE objects, articles RESTART IDENTITY CASCADE');

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
