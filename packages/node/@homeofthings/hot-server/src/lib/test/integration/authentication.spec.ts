// Integration tests are excluded from Jest because the `config` npm package
// cannot be loaded in Jest ESM mode (its .js files use ESM syntax but lack
// "type": "module", causing cjs-module-lexer to fail).
// See ADR-001 in memory-bank/decisions/ for details.
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import supertest from 'supertest';

import * as mockedLogger from '../mocks/logger';
import { TestAppModule } from './fixtures/test-app.module';

describe('Authentication', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAppModule],
    })
      .setLogger(mockedLogger.logger)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  xit(`POST /authentication/login should respond with 401/Unauthorized`, async () => {
    const request = supertest(app.getHttpServer());
    await request.post('/authentication/login').send({ email: 'unknown@example.com', password: 'foo' }).expect(401);

    await request.get('/authentication').expect(401);
  });

  it(`POST /authentication should respond with 401/Unauthorized`, async () => {
    const request = supertest(app.getHttpServer());
    await request.get('/authentication').expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
