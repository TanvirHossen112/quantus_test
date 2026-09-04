import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app.js';

const uniqueCode = (suffix: string) =>
  `TEST-${randomUUID().slice(0, 8)}.${suffix}`;

describe('Articles (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /articles', () => {
    it('creates a root article', async () => {
      const code = uniqueCode('root');
      const res = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code, title: 'Root article' })
        .expect(201);

      expect(res.body).toMatchObject({
        code,
        title: 'Root article',
        parentId: null,
        description: null,
      });
      expect(res.body.id).toEqual(expect.any(String));

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${res.body.id}`)
        .expect(204);
    });

    it('creates a child article under an explicit parentId', async () => {
      const parent = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('parent'), title: 'Parent' })
        .expect(201);

      const child = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('parent.child'),
          title: 'Child',
          parentId: parent.body.id,
        })
        .expect(201);

      expect(child.body.parentId).toBe(parent.body.id);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${child.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${parent.body.id}`)
        .expect(204);
    });

    it('sanitises the description HTML on write', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('sanitize'),
          title: 'Sanitised',
          description: '<p>Ok</p><script>alert(1)</script>',
        })
        .expect(201);

      expect(res.body.description).toBe('<p>Ok</p>');

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${res.body.id}`)
        .expect(204);
    });

    it('rejects a duplicate code with 409', async () => {
      const code = uniqueCode('dup');
      const first = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code, title: 'First' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code, title: 'Second' })
        .expect(409);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${first.body.id}`)
        .expect(204);
    });

    it('rejects an unknown field', () => {
      return request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('unknown-field'),
          title: 'X',
          notAField: true,
        })
        .expect(400);
    });

    it('rejects a missing title', () => {
      return request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('missing-title') })
        .expect(400);
    });
  });

  describe('GET /articles', () => {
    it('lists flat and includes a created article', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('list'), title: 'Listed' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/articles')
        .expect(200);
      expect(
        res.body.some((a: { id: string }) => a.id === created.body.id),
      ).toBe(true);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${created.body.id}`)
        .expect(204);
    });

    it('nests children under their parent with ?tree=true', async () => {
      const parent = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('tree'), title: 'Tree parent' })
        .expect(201);
      const child = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('tree.child'),
          title: 'Tree child',
          parentId: parent.body.id,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/articles?tree=true')
        .expect(200);
      const node = res.body.find(
        (a: { id: string }) => a.id === parent.body.id,
      );
      expect(
        node.children.some((c: { id: string }) => c.id === child.body.id),
      ).toBe(true);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${child.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${parent.body.id}`)
        .expect(204);
    });
  });

  describe('GET /articles/:id', () => {
    it('returns 404 for a well-formed but missing id', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/articles/${randomUUID()}`)
        .expect(404);
    });

    it('returns 400 for a malformed id', () => {
      return request(app.getHttpServer())
        .get('/api/v1/articles/not-a-uuid')
        .expect(400);
    });
  });

  describe('PATCH /articles/:id', () => {
    it('updates fields without clearing parentId when it is omitted', async () => {
      const parent = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('patch-parent'), title: 'Patch parent' })
        .expect(201);
      const child = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('patch-parent.child'),
          title: 'Patch child',
          parentId: parent.body.id,
        })
        .expect(201);

      const patched = await request(app.getHttpServer())
        .patch(`/api/v1/articles/${child.body.id}`)
        .send({ title: 'Renamed child' })
        .expect(200);

      expect(patched.body.title).toBe('Renamed child');
      expect(patched.body.parentId).toBe(parent.body.id);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${child.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${parent.body.id}`)
        .expect(204);
    });

    it('moves an article to root when parentId is explicitly null', async () => {
      const parent = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('move-parent'), title: 'Move parent' })
        .expect(201);
      const child = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('move-parent.child'),
          title: 'Move child',
          parentId: parent.body.id,
        })
        .expect(201);

      const patched = await request(app.getHttpServer())
        .patch(`/api/v1/articles/${child.body.id}`)
        .send({ parentId: null })
        .expect(200);

      expect(patched.body.parentId).toBeNull();

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${child.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${parent.body.id}`)
        .expect(204);
    });

    it('rejects an article being set as its own parent', async () => {
      const article = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('self-parent'), title: 'Self' })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/articles/${article.body.id}`)
        .send({ parentId: article.body.id })
        .expect(400);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${article.body.id}`)
        .expect(204);
    });

    it('rejects a move that would create a cycle', async () => {
      const root = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('cycle-root'), title: 'Cycle root' })
        .expect(201);
      const child = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('cycle-root.child'),
          title: 'Cycle child',
          parentId: root.body.id,
        })
        .expect(201);
      const grandchild = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('cycle-root.child.grandchild'),
          title: 'Cycle grandchild',
          parentId: child.body.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/v1/articles/${root.body.id}`)
        .send({ parentId: grandchild.body.id })
        .expect(400);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${grandchild.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${child.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${root.body.id}`)
        .expect(204);
    });
  });

  describe('DELETE /articles/:id', () => {
    it('blocks deleting an article that still has children (409)', async () => {
      const parent = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({ code: uniqueCode('block-parent'), title: 'Block parent' })
        .expect(201);
      const child = await request(app.getHttpServer())
        .post('/api/v1/articles')
        .send({
          code: uniqueCode('block-parent.child'),
          title: 'Block child',
          parentId: parent.body.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${parent.body.id}`)
        .expect(409);

      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${child.body.id}`)
        .expect(204);
      await request(app.getHttpServer())
        .delete(`/api/v1/articles/${parent.body.id}`)
        .expect(204);
    });

    it('returns 404 deleting a missing article', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/articles/${randomUUID()}`)
        .expect(404);
    });
  });
});
