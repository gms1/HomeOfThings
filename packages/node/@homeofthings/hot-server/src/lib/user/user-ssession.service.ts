import { InjectConnectionPool } from '@homeofthings/nestjs-sqlite3';
import { LruCache } from '@homeofthings/node-sys';
import { Request } from 'express';
import { BaseDAO, SqlConnectionPool, SqlDatabase } from 'sqlite3orm';

import { UserSession } from './entity/user-session';
import { User } from './entity/user.entity';
import { HOT_SESSION_DB } from '../model';

const SESSION_CACHE_SIZE = 20;

export class UserSessionService {
  private cache: LruCache<UserSession> = new LruCache(SESSION_CACHE_SIZE);

  constructor(
    @InjectConnectionPool(HOT_SESSION_DB)
    private sqlConnectionPool: SqlConnectionPool,
  ) {}

  async createSession(user: User, request: Request): Promise<UserSession> {
    let conn: SqlDatabase | undefined = undefined;
    try {
      const session = new UserSession();
      session.userId = user.id;
      session.userEmail = user.email;
      session.userShortName = user.shortName;
      session.clientIp = request.ip as string;
      conn = await this.sqlConnectionPool.get();
      const dao = new BaseDAO(UserSession, conn);
      await dao.insert(session);
      this.cache.set(String(session.id), session);
      return Promise.resolve(session);
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async getSessionById(id: number): Promise<UserSession> {
    const cachedSession = this.cache.get(String(id));
    if (cachedSession) {
      return Promise.resolve(cachedSession);
    }
    let conn: SqlDatabase | undefined = undefined;
    try {
      conn = await this.sqlConnectionPool.get();
      const dao = new BaseDAO(UserSession, conn);
      const session = await dao.selectById({ id });
      this.cache.set(String(session.id), session);
      return Promise.resolve(session);
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }
}
