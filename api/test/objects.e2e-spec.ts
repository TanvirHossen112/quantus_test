import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app.js';

describe('Objects (e2e)', () => {
  let app: INestApplication;
  let articleId: string;

  beforeAll(async () => {
    app = await createTestApp();

    const article = await request(app.getHttpServer())
      .post('/api/v1/articles')
      .send({
        code: `TEST-${randomUUID().slice(0, 8)}.objects`,
        title: 'Objects fixture article',
      })
      .expect(201);
    articleId = article.body.id;
  });

  afterAll(async () => {
    await request(app.getHttpServer()).delete(`/api/v1/articles/${articleId}`);
    await app.close();
  });

  const wall = (overrides: Record<string, unknown> = {}) => ({
    drawingUuid: randomUUID(),
    name: 'Wall W-01 exterior',
    type: 'wall',
    unit: 'm2',
    unitPriceCents: 1450,
    properties: { length: 12.4, height: 2.7 },
    articleId,
    ...overrides,
  });

  describe('POST /objects', () => {
    it('creates an object and computes quantity + lineTotalCents', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall())
        .expect(201);

      expect(res.body.quantity).toBeCloseTo(33.48);
      expect(res.body.lineTotalCents).toBe(48546);

      await request(app.getHttpServer())
        .delete(`/api/v1/objects/${res.body.id}`)
        .expect(204);
    });

    it('rejects a unit missing its required properties', () => {
      return request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall({ properties: { length: 12.4 } }))
        .expect(400);
    });

    it('rejects an articleId that does not reference an existing article', () => {
      return request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall({ articleId: randomUUID() }))
        .expect(400);
    });

    it('rejects a duplicate drawingUuid with 409', async () => {
      const drawingUuid = randomUUID();
      const first = await request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall({ drawingUuid }))
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall({ drawingUuid }))
        .expect(409);

      await request(app.getHttpServer())
        .delete(`/api/v1/objects/${first.body.id}`)
        .expect(204);
    });
  });

  describe('GET /objects', () => {
    it('filters by articleId', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall())
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/objects?articleId=${articleId}`)
        .expect(200);
      expect(
        res.body.some((o: { id: string }) => o.id === created.body.id),
      ).toBe(true);

      await request(app.getHttpServer())
        .delete(`/api/v1/objects/${created.body.id}`)
        .expect(204);
    });

    it('returns 400 for a malformed articleId filter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/objects?articleId=not-a-uuid')
        .expect(400);
    });
  });

  describe('GET /objects/:id', () => {
    it('returns 404 for a well-formed but missing id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/objects/${randomUUID()}`)
        .expect(404);
    });
  });

  describe('PATCH /objects/:id', () => {
    it('recomputes the line total after a price change', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall())
        .expect(201);

      const patched = await request(app.getHttpServer())
        .patch(`/api/v1/objects/${created.body.id}`)
        .send({ unitPriceCents: 2000 })
        .expect(200);

      expect(patched.body.lineTotalCents).toBe(Math.round(33.48 * 2000));

      await request(app.getHttpServer())
        .delete(`/api/v1/objects/${created.body.id}`)
        .expect(204);
    });

    it('re-validates properties against a newly assigned unit', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall())
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/objects/${created.body.id}`)
        .send({ unit: 'm3' })
        .expect(400);

      await request(app.getHttpServer())
        .delete(`/api/v1/objects/${created.body.id}`)
        .expect(204);
    });
  });

  describe('DELETE /objects/:id', () => {
    it('deletes an object and then 404s on refetch', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/objects')
        .send(wall())
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/objects/${created.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .get(`/api/v1/objects/${created.body.id}`)
        .expect(404);
    });

    it('returns 404 deleting a missing object', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/objects/${randomUUID()}`)
        .expect(404);
    });
  });
});
