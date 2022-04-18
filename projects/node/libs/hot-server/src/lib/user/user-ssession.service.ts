import { Request } from 'express';
import { User } from './entity/user.entity';
import { UserSession } from './entity/user-session';
import { BaseDAO, SqlConnectionPool, SqlDatabase } from 'sqlite3orm';
import { HOT_MAIN_DB } from '../model';
import { InjectConnectionPool } from '@homeofthings/nestjs-sqlite3';
import { LruCache } from '@homeofthings/nestjs-utils';

const SESSION_CACHE_SIZE = 20;

export class SessionService {
  private cache: LruCache<UserSession> = new LruCache(SESSION_CACHE_SIZE);

  constructor(@InjectConnectionPool(HOT_MAIN_DB) private sqlConnectionPool: SqlConnectionPool) {}

  async getUserByEmail(email: string): Promise<User> {
    let conn: SqlDatabase;
    try {
      conn = await this.sqlConnectionPool.get();
      const dao = new BaseDAO(User, conn);
      return dao.selectOne({ email });
    } catch (err) {
      return Promise.reject(err);
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  async setFailedLoginAttempt(_user: User, _request: Request): Promise<void> {
    // TODO:
  }

  async createSession(user: User, request: Request): Promise<UserSession> {
    let conn: SqlDatabase;
    try {
      const session = new UserSession();
      session.userId = user.id;
      session.userEmail = user.email;
      session.userShortName = user.shortName;
      session.clientIp = request.ip;
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
    let conn: SqlDatabase;
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
