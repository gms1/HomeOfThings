/* eslint-disable @typescript-eslint/no-unused-vars */
import { AutoUpgrader, BaseDAO } from 'sqlite3orm';
import { ConnectionManager } from '@homeofthings/nestjs-sqlite3';
import { Contact } from './entity/contact';
import { User } from './entity/user';

export const DONALD_DUCK_FIRST_NAME = 'Donald';
export const DONALD_DUCK_LAST_NAME = 'Duck';
export const DONALD_DUCK_EMAIL = 'donald@duck.com';
export const DONALD_DUCK_LOGIN_NAME = DONALD_DUCK_EMAIL;

export const CHUCK_NORRIS_FIRST_NAME = 'Chuck';
export const CHUCK_NORRIS_LAST_NAME = 'Norris';
export const CHUCK_NORRIS_EMAIL = 'chuck@ChuckNorris.com';
export const CHUCK_NORRIS_EMAIL2 = 'chuck.noris@ChuckNorris.com';
export const CHUCK_NORRIS_LOGIN_NAME = CHUCK_NORRIS_EMAIL;

export const DONALD_TRUMP_FIRST_NAME = 'Donald';
export const DONALD_TRUMP_LAST_NAME = 'Trump';
export const DONALD_TRUMP_EMAIL = 'donald@trump.com';
export const DONALD_TRUMP_LOGIN_NAME = DONALD_TRUMP_EMAIL;

export async function initDatabase(connectionManager: ConnectionManager, connectionName: string) {
  try {
    const db = await connectionManager.getConnectionPool(connectionName).get();
    const autoUpgrade = new AutoUpgrader(db);
    if (await autoUpgrade.isActual(ConnectionManager.getTables(connectionName))) {
      console.error('database schema already exists');
    }
    await autoUpgrade.upgradeTables(ConnectionManager.getTables(connectionName));
    const userDao = new BaseDAO<User>(User, db);
    const contactDao = new BaseDAO<Contact>(Contact, db);
    let user: Partial<User>;
    let contact: Partial<Contact>;

    if (await contactDao.exists()) {
      console.error('contact data already exists');
      await contactDao.deleteAll();
    }
    if (await userDao.exists()) {
      console.error('user data already exists');
      await userDao.deleteAll();
    }

    user = await userDao.insertPartial({ userLoginName: DONALD_DUCK_LOGIN_NAME, userFirstName: DONALD_DUCK_FIRST_NAME, userLastName: DONALD_DUCK_LAST_NAME });
    contact = await contactDao.insertPartial({ userId: user.userId, emailAddress: DONALD_DUCK_EMAIL });

    user = await userDao.insertPartial({ userLoginName: CHUCK_NORRIS_LOGIN_NAME, userFirstName: CHUCK_NORRIS_FIRST_NAME, userLastName: CHUCK_NORRIS_LAST_NAME });
    contact = await contactDao.insertPartial({ userId: user.userId, emailAddress: CHUCK_NORRIS_EMAIL });
    contact = await contactDao.insertPartial({ userId: user.userId, emailAddress: CHUCK_NORRIS_EMAIL2 });

    user = await userDao.insertPartial({ userLoginName: DONALD_TRUMP_LOGIN_NAME, userFirstName: DONALD_TRUMP_LOGIN_NAME, userLastName: DONALD_TRUMP_LAST_NAME });
  } catch (e) {
    console.error(`init database failed: `, e);
    throw e;
  }
}
