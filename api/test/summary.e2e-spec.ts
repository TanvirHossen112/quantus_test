import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app.js';

describe('Summary (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rolls up own objects and descendant articles into the top-level subtotal, and into the grand total', async () => {
    const before = await request(app.getHttpServer())
      .get('/api/v1/summary')
      .expect(200);

    const suffix = randomUUID().slice(0, 8);

    const masonry = await request(app.getHttpServer())
      .post('/api/v1/articles')
      .send({ code: `TEST-${suffix}.20`, title: 'Test Masonry' })
      .expect(201);
    const materials = await request(app.getHttpServer())
      .post('/api/v1/articles')
      .send({
        code: `TEST-${suffix}.20.11`,
        title: 'Test Materials',
        parentId: masonry.body.id,
      })
      .expect(201);

    const door = await request(app.getHttpServer())
      .post('/api/v1/objects')
      .send({
        drawingUuid: randomUUID(),
        name: 'Door D-01',
        type: 'door',
        unit: 'piece',
        unitPriceCents: 34000,
        properties: { count: 3 },
        articleId: masonry.body.id,
      })
      .expect(201);

    const wall = await request(app.getHttpServer())
      .post('/api/v1/objects')
      .send({
        drawingUuid: randomUUID(),
        name: 'Wall W-01 exterior',
        type: 'wall',
        unit: 'm2',
        unitPriceCents: 1450,
        properties: { length: 12.4, height: 2.7 },
        articleId: materials.body.id,
      })
      .expect(201);

    const roofing = await request(app.getHttpServer())
      .post('/api/v1/articles')
      .send({ code: `TEST-${suffix}.30`, title: 'Test Roofing' })
      .expect(201);
    const roofObject = await request(app.getHttpServer())
      .post('/api/v1/objects')
      .send({
        drawingUuid: randomUUID(),
        name: 'Roof slab',
        type: 'roof',
        unit: 'm2',
        unitPriceCents: 5000,
        properties: { length: 10, height: 5 },
        articleId: roofing.body.id,
      })
      .expect(201);

    const after = await request(app.getHttpServer())
      .get('/api/v1/summary')
      .expect(200);

    const masonrySubtotal = after.body.articles.find(
      (a: { id: string }) => a.id === masonry.body.id,
    );
    const roofingSubtotal = after.body.articles.find(
      (a: { id: string }) => a.id === roofing.body.id,
    );
    const materialsAtTopLevel = after.body.articles.find(
      (a: { id: string }) => a.id === materials.body.id,
    );

    expect(masonrySubtotal.subtotal).toBe(102000 + 48546);
    expect(roofingSubtotal.subtotal).toBe(250000);
    expect(materialsAtTopLevel).toBeUndefined();
    expect(after.body.grandTotal - before.body.grandTotal).toBe(
      102000 + 48546 + 250000,
    );

    await request(app.getHttpServer())
      .delete(`/api/v1/objects/${roofObject.body.id}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/v1/objects/${wall.body.id}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/v1/objects/${door.body.id}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/v1/articles/${roofing.body.id}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/v1/articles/${materials.body.id}`)
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/api/v1/articles/${masonry.body.id}`)
      .expect(204);
  });
});
