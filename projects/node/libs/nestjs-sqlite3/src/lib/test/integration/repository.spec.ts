/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as mockedLogger from '../mocks/logger';

import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionManager, Sqlite3ConnectionOptions, Sqlite3Module, SQLITE3_DEFAULT_CONNECTION_NAME } from '@homeofthings/nestjs-sqlite3';
import { Contact } from './fixtures/entity/contact';
import { ContactRepositoryService } from './fixtures/service/contact.repository.service';
import { UserRepositoryService } from './fixtures/service/user.repository.service';
import { UserRepository } from './fixtures/repository/user.repository';
import * as init from './fixtures/init';
import { User } from './fixtures/entity/user';

const CONNECTION_OPTIONS: Sqlite3ConnectionOptions = {
  file: 'file:repository.spec.db?mode=memory&cache=shared',
};

describe('Repository-Integration', () => {
  let appModule: TestingModule;
  let connectionManager: ConnectionManager;
  let userService: UserRepositoryService;
  let contactService: ContactRepositoryService;

  beforeAll(async () => {
    appModule = await Test.createTestingModule({
      imports: [Sqlite3Module.register(CONNECTION_OPTIONS), Sqlite3Module.forFeature([UserRepository, Contact])],
      providers: [UserRepositoryService, ContactRepositoryService],
    })
      .setLogger(mockedLogger.logger)
      .compile();
    appModule.enableShutdownHooks();
    connectionManager = appModule.get(ConnectionManager);
    await init.initDatabase(connectionManager, SQLITE3_DEFAULT_CONNECTION_NAME);
    userService = appModule.get(UserRepositoryService);
    expect(userService).toBeInstanceOf(UserRepositoryService);
    contactService = appModule.get(ContactRepositoryService);
    expect(contactService).toBeInstanceOf(ContactRepositoryService);
    await connectionManager.createConnectionContext();
  });

  afterAll(async () => {
    await connectionManager.closeConnectionContext(false);
    if (appModule) {
      appModule.close();
    }
    appModule = undefined;
    (ConnectionManager as any)._instance = undefined;
    (ConnectionManager as any).tablesPerConnection = undefined;
  });

  it('`exists` should return truthy', async () => {
    expect(await userService.userLoginNameExists(init.CHUCK_NORRIS_LOGIN_NAME)).toBeTruthy();
  });

  it('`exists` should return falsy', async () => {
    expect(await contactService.contactEmailAddressExists(init.DONALD_TRUMP_EMAIL)).toBeFalsy();
  });

  it('`count` should succeed if exist', async () => {
    const user = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
    expect(await contactService.countContacts(user.userId)).toBe(2);
  });

  it('`count` should succeed if not exist', async () => {
    const user = await userService.findUserByUserLoginName(init.DONALD_TRUMP_EMAIL);
    expect(await contactService.countContacts(user.userId)).toBe(0);
  });

  it('`findById` should succeed if exist', async () => {
    const user = await userService.findUserByUserLoginName(init.DONALD_TRUMP_EMAIL);
    const user2 = await userService.findById(user.userId);
    expect(user2).toBeInstanceOf(User);
    expect(user2.userId).toBe(user.userId);
  });

  it('`findById` should fail if not exist', async () => {
    try {
      await userService.findById(-1);
    } catch (_e) {
      return;
    }
    fail('should have thrown');
  });

  it('`findOne` should succeed if exist', async () => {
    const user = await userService.findUserByUserLoginName(init.DONALD_TRUMP_EMAIL);
    const user2 = await userService.findOne({ userId: user.userId });
    expect(user2).toBeInstanceOf(User);
    expect(user2.userId).toBe(user.userId);
  });

  it('`findOne` should fail if not exist', async () => {
    try {
      await userService.findOne({ userId: -1 });
    } catch (_e) {
      return;
    }
    fail('should have thrown');
  });

  it('`findOne` should fail if multiple exist', async () => {
    try {
      await userService.findOne({ userFirstName: init.DONALD });
    } catch (_e) {
      return;
    }
    fail('should have thrown');
  });

  it('`findByChild` should succeed if exist', async () => {
    const contacts = await contactService.findAllContacts();
    const user = await userService.findByChild(contacts[0]);
    expect(user.userId).toBe(contacts[0].userId);

    const user2 = await contactService.findParentOf(contacts[0]);
    expect(user2).toStrictEqual(user);
  });

  it('`findByChild` should fail if not exist', async () => {
    try {
      const contact = new Contact();
      contact.userId = -1;
      await userService.findByChild(contact);
    } catch (_e) {
      return;
    }
    fail('should have thrown');
  });

  it('`findParentOf` should succeed if exist', async () => {
    const contacts = await contactService.findAllContacts();
    const user = await contactService.findParentOf(contacts[0]);
    expect(user.userId).toBe(contacts[0].userId);

    const user2 = await userService.findByChild(contacts[0]);
    expect(user2).toStrictEqual(user);
  });

  it('`findParentOf` should fail if not exist', async () => {
    try {
      const contact = new Contact();
      contact.userId = -1;
      await await contactService.findParentOf(contact);
    } catch (_e) {
      return;
    }
    fail('should have thrown');
  });

  it('`findAllByParent` should succeed if exist', async () => {
    const user = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
    const userContacts = await contactService.findAllByParent(user);
    expect(userContacts.length).toBe(2);

    const userContacts2 = await userService.findAllChildContactsOf(user);
    expect(userContacts2).toStrictEqual(userContacts);
  });

  it('`findAllByParent` should succeed if not exist', async () => {
    const user = new User();
    user.userId = -1;
    const userContacts = await contactService.findAllByParent(user);
    expect(userContacts.length).toBe(0);
  });

  it('`findAllChildsOf` should succeed if exist', async () => {
    const user = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
    const userContacts = await userService.findAllChildContactsOf(user);
    expect(userContacts.length).toBe(2);

    const userContacts2 = await contactService.findAllByParent(user);
    expect(userContacts2).toStrictEqual(userContacts);
  });

  it('`findAllChildsOf` should succeed if not exist', async () => {
    const user = new User();
    user.userId = -1;
    const userContacts = await userService.findAllChildContactsOf(user);
    expect(userContacts.length).toBe(0);
  });

  it('`insert` should succeed if not exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = new User();
      givenUser.userLoginName = 'foo';
      givenUser.userFirstName = 'foo';
      givenUser.userLastName = 'bar';
      givenUser.userId = 1;

      const savedUser = await userService.insert(givenUser);
      expect(savedUser).toBe(givenUser);
      expect(savedUser.userId).toBeGreaterThan(1);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`insertPartial` should succeed if not exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = new User();
      givenUser.userLoginName = 'foo';
      givenUser.userFirstName = 'foo';
      givenUser.userLastName = 'bar';
      givenUser.userId = 1;

      const savedUser = await userService.insertPartial(givenUser);
      expect(savedUser).toBe(givenUser);
      expect(savedUser.userId).toBeGreaterThan(1);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`save` should succeed if not exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = new User();
      givenUser.userLoginName = 'foo';
      givenUser.userFirstName = 'foo';
      givenUser.userLastName = 'bar';
      givenUser.userId = null;

      const savedUser = await userService.save(givenUser);
      expect(savedUser).toBe(givenUser);
      expect(savedUser.userId).toBeGreaterThan(1);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`save` should succeed if exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      const givenLoginName = 'baz';
      expect(givenUser.userLoginName !== givenLoginName).toBeTruthy();
      givenUser.userLoginName = givenLoginName;

      const savedUser = await userService.save(givenUser);
      expect(savedUser).toBe(givenUser);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser.userLoginName).toBe(givenLoginName);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`savePartial` should succeed if not exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = new User();
      givenUser.userLoginName = 'foo';
      givenUser.userFirstName = 'foo';
      givenUser.userLastName = 'bar';
      givenUser.userId = null;

      const savedUser = await userService.savePartial(givenUser);
      expect(savedUser).toBe(givenUser);
      expect(savedUser.userId).toBeGreaterThan(1);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`savePartial` should succeed if exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      const givenLoginName = 'baz';
      expect(givenUser.userLoginName !== givenLoginName).toBeTruthy();
      givenUser.userLoginName = givenLoginName;

      const savedUser = await userService.savePartial(givenUser);
      expect(savedUser).toBe(givenUser);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser.userLoginName).toBe(givenLoginName);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`update` should succeed if exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      const givenLoginName = 'baz';
      expect(givenUser.userLoginName !== givenLoginName).toBeTruthy();
      givenUser.userLoginName = givenLoginName;

      const savedUser = await userService.update(givenUser);
      expect(savedUser).toBe(givenUser);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser.userLoginName).toBe(givenLoginName);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`update` should fail if not exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = new User();
      givenUser.userLoginName = 'foo';
      givenUser.userFirstName = 'foo';
      givenUser.userLastName = 'bar';
      givenUser.userId = -1;

      await userService.update(givenUser);
    } catch (_e) {
      return;
    } finally {
      await connection.rollbackTransaction();
    }
    fail('should have thrown');
  });

  it('`updatePartial` should succeed if exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      const givenLoginName = 'baz';
      expect(givenUser.userLoginName !== givenLoginName).toBeTruthy();
      givenUser.userLoginName = givenLoginName;

      const savedUser = await userService.updatePartial(givenUser);
      expect(savedUser).toBe(givenUser);

      const foundUser = await userService.findById(savedUser.userId);
      expect(foundUser.userLoginName).toBe(givenLoginName);
      expect(foundUser).toStrictEqual(savedUser);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`updatePartial` should fail if not exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = new User();
      givenUser.userLoginName = 'foo';
      givenUser.userFirstName = 'foo';
      givenUser.userLastName = 'bar';
      givenUser.userId = -1;

      await userService.updatePartial(givenUser);
    } catch (_e) {
      return;
    } finally {
      await connection.rollbackTransaction();
    }
    fail('should have thrown');
  });

  it('`updatePartialAll` should succeed if exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenLastName = 'baz';

      const savedUserCount = await userService.updatePartialAll({ userLastName: givenLastName }, { userLoginName: init.CHUCK_NORRIS_LOGIN_NAME });
      expect(savedUserCount).toBe(1);

      const foundUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      expect(foundUser.userLastName).toBe(givenLastName);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`updatePartialAll` should succeed if not exist', async () => {
    // TODO: requires BaseDAO.options.ignoreNoChanges to be `true` (please see sqlite3-core.module.ts)
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenLastName = 'baz';
      const givenLoginName = 'bar';

      const savedUserCount = await userService.updatePartialAll({ userLastName: givenLastName }, { userLoginName: givenLoginName });
      expect(savedUserCount).toBe(0);
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`deleteById` should succeed if exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      await userService.deleteById(givenUser);

      const foundUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      expect(foundUser).toBeUndefined();
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`deleteById` should fail if not exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenUser = new User();
      givenUser.userId = -1;

      await userService.deleteById(givenUser);
    } catch (_e) {
      return;
    } finally {
      await connection.rollbackTransaction();
    }
    fail('should have thrown');
  });

  it('`deleteAll` should succeed if exist', async () => {
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const deletedUserCount = await userService.deleteAll({ userLoginName: init.CHUCK_NORRIS_LOGIN_NAME });
      expect(deletedUserCount).toBe(1);

      const foundUser = await userService.findUserByUserLoginName(init.CHUCK_NORRIS_LOGIN_NAME);
      expect(foundUser).toBeUndefined();
    } finally {
      await connection.rollbackTransaction();
    }
  });

  it('`deleteAll` should succeed if not exist', async () => {
    // TODO: requires BaseDAO.options.ignoreNoChanges to be `true` (please see sqlite3-core.module.ts)
    const connection = await connectionManager.getConnection(SQLITE3_DEFAULT_CONNECTION_NAME);
    await connection.beginTransaction();
    try {
      const givenLoginName = 'bar';

      const deletedUserCount = await userService.deleteAll({ userLoginName: givenLoginName });
      expect(deletedUserCount).toBe(0);
    } finally {
      await connection.rollbackTransaction();
    }
  });
});
