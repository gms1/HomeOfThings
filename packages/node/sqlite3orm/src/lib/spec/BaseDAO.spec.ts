/* eslint-disable no-empty */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseDAO, BaseDAOInsertMode, field, fk, id, index, schema, SQL_MEMORY_DB_PRIVATE, SqlDatabase, table } from '..';
import { failTest } from '../test';

describe(`BaseDAO`, () => {
  describe('BaseDAO instantiation', () => {
    let sqldb: SqlDatabase;

    class NoTable {
      id!: number;
    }
    // ---------------------------------------------
    beforeEach(async () => {
      try {
        sqldb = new SqlDatabase();
        await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      } catch (err) {
        failTest(err);
      }
    });
    // ---------------------------------------------

    it('expect class without table-definition to throw', async () => {
      try {
        const noTableDao: BaseDAO<NoTable> = new BaseDAO(NoTable, sqldb);
        failTest('instantiation BaseDAO for class without table-definition should have thrown');
      } catch (err) {}
    });
  });

  // ---------------------------------------------

  describe('BaseDAO basic functionality', () => {
    let sqldb: SqlDatabase;

    const USERS_TABLE = 'BD:USERS TABLE';
    const CONTACTS_TABLE = 'main.BD:CONTACTS TABLE';

    @table({ name: USERS_TABLE })
    class User {
      @id({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
      userId!: number;

      @field({ name: 'user_loginname', dbtype: 'TEXT NOT NULL' })
      userLoginName: string;

      notMapped?: string;

      constructor() {
        this.userLoginName = 'noname';
      }
    }

    @table({ name: CONTACTS_TABLE, autoIncrement: true })
    class Contact {
      static userConstraint = 'user';

      @id({ name: 'contact_id', dbtype: 'INTEGER NOT NULL' })
      contactId!: number;

      @field({ name: 'contact_email', dbtype: 'TEXT' })
      emailAddress: string;

      @field({ name: 'contact_mobile', dbtype: 'TEXT' })
      mobile: string;

      @fk(Contact.userConstraint, USERS_TABLE, 'user_id')
      @field({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
      userId!: number;

      notMapped?: string;

      constructor() {
        this.emailAddress = 'noemail';
        this.mobile = 'nomobile';
      }
    }

    // ---------------------------------------------
    beforeEach(async () => {
      try {
        schema().dateInMilliSeconds = false;
        sqldb = new SqlDatabase();
        await sqldb.open(SQL_MEMORY_DB_PRIVATE);

        const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
        const contactDao: BaseDAO<Contact> = new BaseDAO(Contact, sqldb);
        await userDao.createTable();
        await contactDao.createTable();
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect basic functionality (insert/update/delete/select/selectAll/countAll/exists) to work', async () => {
      try {
        let user1a: User = new User();
        let user1b: User = new User();
        const user2: User = new User();
        const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);

        expect(await userDao.exists()).toBe(false);
        user1a.userId = 1;
        user1a.userLoginName = 'login1/1';
        await userDao.insert(user1a);
        expect(await userDao.exists()).toBe(true);

        user1b.userId = user1a.userId;
        user1b.userLoginName = 'login1/2';
        await userDao.update(user1b);

        user2.userId = 2;
        user2.userLoginName = 'login2';
        await userDao.insert(user2);

        await userDao.select(user1a);
        expect(user1a.userId).toBe(user1b.userId);
        expect(user1a.userLoginName).toBe(user1b.userLoginName);

        user1a = await userDao.selectById({ userId: 1 });
        expect(user1a.userId).toBe(user1b.userId);
        expect(user1a.userLoginName).toBe(user1b.userLoginName);

        const allUsersFirst = await userDao.selectAll();
        const countAllUsersFirst = await userDao.countAll();
        expect(allUsersFirst.length).toBe(2);
        expect(countAllUsersFirst).toBe(allUsersFirst.length);
        user1b = allUsersFirst[0];
        expect(user1a.userId).toBe(user1b.userId);
        expect(user1a.userLoginName).toBe(user1b.userLoginName);

        await userDao.delete(user1a);
        const allUsersSecond = await userDao.selectAll();
        const countAllUsersSecond = await userDao.countAll();
        expect(allUsersFirst.length).toBe(allUsersSecond.length + 1);
        expect(countAllUsersSecond).toBe(allUsersSecond.length);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect foreign key select to work', async () => {
      try {
        const user: User = new User();
        let contact: Contact = new Contact();
        const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
        const contactDao: BaseDAO<Contact> = new BaseDAO(Contact, sqldb);

        user.userId = 1;
        user.userLoginName = 'login1';
        await userDao.insert(user);

        user.userId = 2;
        user.userLoginName = 'login2';
        await userDao.insert(user);

        user.userId = 3;
        user.userLoginName = 'login3';
        await userDao.insert(user);

        contact.userId = 1;
        contact.emailAddress = 'user1@test1.net';
        contact = await contactDao.insert(contact, BaseDAOInsertMode.ForceAutoGeneration);
        expect(contact.contactId).toBe(1);

        contact.userId = 1;
        contact.emailAddress = 'user1@test2.net';
        contact = await contactDao.insert(contact, BaseDAOInsertMode.ForceAutoGeneration);
        expect(contact.contactId).toBe(2);

        contact.userId = 2;
        contact.emailAddress = 'user2@test.net';
        contact = await contactDao.insert(contact, BaseDAOInsertMode.ForceAutoGeneration);
        expect(contact.contactId).toBe(3);

        user.userId = 1;
        const contactsUser1 = await contactDao.selectAllOf(Contact.userConstraint, User, user);
        expect(contactsUser1.length).toBe(2);

        user.userId = 2;
        const contactsUser2 = await contactDao.selectAllOf(Contact.userConstraint, User, user);
        expect(contactsUser2.length).toBe(1);

        user.userId = 3;
        const contactsUser3 = await contactDao.selectAllOf(Contact.userConstraint, User, user);
        expect(contactsUser3.length).toBe(0);

        user.userId = 1;
        const contactsUser1$1 = await contactDao.selectAllOf(Contact.userConstraint, User, user, ' AND contact_email=:contact_email', { ':contact_email': 'user1@test2.net' });
        expect(contactsUser1$1.length).toBe(1);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect inserting duplicate id to throw', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = 1;
        user1.userLoginName = 'login1/1';
        await userDao.insert(user1);
      } catch (err) {
        failTest(err);
      }
      try {
        user1.userId = 1;
        user1.userLoginName = 'login1/2';
        await userDao.insert(user1, BaseDAOInsertMode.StrictSqlite);
        failTest('inserting duplicate id should have thrown');
      } catch (err) {}
    });

    // ---------------------------------------------
    it('expect updating using wrong id to throw', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = undefined as any as number;
        user1.userLoginName = 'login1/2';
        await userDao.update(user1);
        failTest('updating using wrong id should have thrown');
      } catch (err) {}
    });

    // ---------------------------------------------
    it('expect updating not null column with null to throw', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = 1;
        user1.userLoginName = 'login1/1';
        await userDao.insert(user1);
      } catch (err) {
        failTest(err);
      }
      try {
        user1.userId = 1;
        user1.userLoginName = undefined as any as string;
        await userDao.update(user1);
        failTest('updating not null column with null should have thrown');
      } catch (err) {}
    });

    // ---------------------------------------------
    it('expect deleting using wrong id to throw', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = undefined as any as number;
        user1.userLoginName = 'login1/2';
        await userDao.delete(user1);
        failTest('deleting using wrong id should have thrown');
      } catch (err) {}
    });

    // ---------------------------------------------
    it('expect deleting by id using wrong id to throw', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = undefined as any as number;
        user1.userLoginName = 'login1/2';
        await userDao.deleteById(user1);
        failTest('deleting using wrong id should have thrown');
      } catch (err) {}
    });

    // ---------------------------------------------
    it('expect deleting by id to succeed', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = 1;
        user1.userLoginName = 'login1/1';
        await userDao.insert(user1);
        await userDao.selectById({ userId: 1 });
        expect(user1.userId).toBe(1);
        user1.userId = 1;
        await userDao.deleteById({ userId: 1 });
      } catch (err) {
        failTest(err);
      }
      try {
        await userDao.selectById({ userId: 1 });
        failTest('row should have been deleted');
      } catch (err) {}
      try {
        await userDao.selectAll('WHERE noColumn=9');
        failTest('a condition using not existing column should have thrown');
      } catch (err) {}
    });

    // ---------------------------------------------
    it('expect selectAll to throw on failure', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        await userDao.selectAll('WHERE noColumn=9');
        failTest('a condition using not existing column should have thrown');
      } catch (err) {}
    });
    // ---------------------------------------------
    it('expect selectEach to throw on failure', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = 1;
        await userDao.selectEach(() => {}, 'WHERE noColumn=9');
        failTest('a condition using not existing column should have thrown');
      } catch (err) {}
    });

    // ---------------------------------------------
    it('expect selectEach to succeed', async () => {
      const user1: User = new User();
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      try {
        user1.userId = 1;
        user1.userLoginName = 'login1/1';
        await userDao.insert(user1);
      } catch (err) {
        failTest(err);
      }
      try {
        let user2: User = new User();
        await userDao.selectEach((err, usr) => (user2 = usr), 'WHERE user_id=1');
        expect(user1.userId).toBe(user2.userId);
        expect(user1.userLoginName).toBe(user2.userLoginName);
        await userDao.selectEach((err, usr) => (user2 = usr));
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect selectAllOf for undefined constraint to fail', async () => {
      const userDao: BaseDAO<User> = new BaseDAO(User, sqldb);
      const contact: Contact = new Contact();
      try {
        const usersContact1 = await userDao.selectAllOf('undefConstraint', Contact, contact);
        failTest('selectAllOf for undefined constraint should have failed');
      } catch (err) {}
    });
  });

  describe('BaseDAO property convertion', () => {
    let sqldb: SqlDatabase;
    const TEST_SET_PROP_TABLE = 'BD:TEST_SET_PROP_TABLE';

    @table({ name: TEST_SET_PROP_TABLE })
    class TestSetProperty {
      @id({ name: 'id', dbtype: 'INTEGER NOT NULL' })
      id!: number;

      @field({ name: 'my_bool_text', dbtype: 'TEXT' })
      myBool2Text?: boolean;

      @field({ name: 'my_number_text', dbtype: 'TEXT' })
      myNumber2Text?: number;

      @field({ name: 'my_string_int', dbtype: 'INTEGER' })
      myString2Number?: string;

      @field({
        name: 'my_date_sec_real',
        dbtype: 'REAL',
        dateInMilliSeconds: false,
      })
      myDate2Seconds?: Date;

      @field({
        name: 'my_date_milli_real',
        dbtype: 'REAL',
        dateInMilliSeconds: true,
      })
      myDate2Milliseconds?: Date;

      notMapped?: string;
    }

    // ---------------------------------------------
    beforeEach(async () => {
      try {
        sqldb = new SqlDatabase();
        await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect setProperty to work if conversion is required', async () => {
      const testDao: BaseDAO<TestSetProperty> = new BaseDAO(TestSetProperty, sqldb);
      let testRow: TestSetProperty = new TestSetProperty();
      try {
        await testDao.createTable();
        await sqldb.exec(`
          INSERT INTO "${TEST_SET_PROP_TABLE}" (
            id,
            my_bool_text,
            my_number_text,
            my_string_int,
            my_date_sec_real,
            my_date_milli_real
          ) values (
            1,
            "abc",
            "42",
            24,
            3.14,
            3.14
          )
        `);
        testRow = await testDao.selectById({ id: 1 });
        expect(testRow.myBool2Text).toBeUndefined();
        expect(testRow.myNumber2Text).toBe(42);
        expect(testRow.myString2Number).toBe('24');
        expect(testRow.myDate2Seconds!.getTime()).toBeNaN();
        expect(testRow.myDate2Milliseconds!.getTime()).toBeNaN();
      } catch (err) {
        failTest(err);
      }
    });
  });

  describe('BaseDAO index creation', () => {
    let sqldb: SqlDatabase;

    const TEST_INDEX_TABLE1 = 'main.BD:INDEX_TABLE';
    const TEST_INDEX_TABLE2 = 'temp.BD:INDEX_TABLE';
    const TEST_INDEX_NAME = 'index_table_idx';

    @table({ name: TEST_INDEX_TABLE1, autoIncrement: true })
    class TestIndexTable1 {
      @id({ name: 'id', dbtype: 'INTEGER NOT NULL' })
      id!: number;

      @field({ name: 'info', dbtype: 'TEXT' })
      @index(TEST_INDEX_NAME)
      info?: string;

      @field({ name: 'otherId', dbtype: 'INTEGER' })
      otherId?: number;

      notMapped?: string;
    }

    @table({ name: TEST_INDEX_TABLE2, autoIncrement: true })
    class TestIndexTable2 {
      @id({ name: 'id', dbtype: 'INTEGER NOT NULL' })
      id!: number;

      @field({ name: 'info', dbtype: 'TEXT' })
      @index(TEST_INDEX_NAME)
      info?: string;

      @field({ name: 'otherId', dbtype: 'INTEGER' })
      otherId?: number;

      notMapped?: string;
    }

    // ---------------------------------------------
    beforeEach(async () => {
      try {
        sqldb = new SqlDatabase();
        await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      } catch (err) {
        failTest(err);
      }
    });
    // ---------------------------------------------
    it('expect create tables/indexes to work for tables/indexes having same name but different schema ', async () => {
      const table1DAO: BaseDAO<TestIndexTable1> = new BaseDAO(TestIndexTable1, sqldb);
      const table2DAO: BaseDAO<TestIndexTable2> = new BaseDAO(TestIndexTable2, sqldb);
      try {
        await table1DAO.createTable();
        await table2DAO.createTable();

        await table1DAO.createIndex(TEST_INDEX_NAME);
        await table2DAO.createIndex(TEST_INDEX_NAME);

        await table1DAO.dropTable();
        await table2DAO.dropTable();
      } catch (err) {
        failTest(err);
      }
    });
  });

  describe('BaseDAO partial operations and defaults', () => {
    let sqldb: SqlDatabase;

    const TEST_DB_DEFAULTS = 'BD:TEST_DB_DEFAULTS_TABLE';
    const TEST_UNIQUE_INDEX_NAME = 'my_string_unique_idx';

    @table({ name: TEST_DB_DEFAULTS, autoIncrement: true })
    class TestDbDefaultsFull {
      @id({ name: 'id', dbtype: 'INTEGER NOT NULL' })
      id!: number;

      @field({ name: 'my_bool', dbtype: 'TEXT DEFAULT 1' })
      myBool?: boolean;

      @field({ name: 'my_integer', dbtype: 'INTEGER DEFAULT 42' })
      myInt?: number;

      @field({ name: 'my_string', dbtype: "TEXT DEFAULT 'sqlite3orm'" })
      @index(TEST_UNIQUE_INDEX_NAME, true)
      myString?: string;

      @field({ name: 'my_real', dbtype: 'REAL DEFAULT 3.1415692' })
      myReal?: number;

      notMapped?: string;
    }

    let fullDao: BaseDAO<TestDbDefaultsFull>;

    @table({ name: TEST_DB_DEFAULTS })
    class TestDbDefaultsMin {
      @id({ name: 'id', dbtype: 'INTEGER NOT NULL' })
      id!: number;

      notMapped?: string;
    }

    // ---------------------------------------------
    beforeEach(async () => {
      try {
        sqldb = new SqlDatabase();
        await sqldb.open(SQL_MEMORY_DB_PRIVATE);
        fullDao = new BaseDAO(TestDbDefaultsFull, sqldb);
        await fullDao.createTable();
        await fullDao.createIndex(TEST_UNIQUE_INDEX_NAME);
      } catch (err) {
        failTest(err);
      }
    });

    afterEach(async () => {
      try {
        await fullDao.dropTable();
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect default-clause to work: using additional model', async () => {
      const minDao: BaseDAO<TestDbDefaultsMin> = new BaseDAO(TestDbDefaultsMin, sqldb);
      const writeRow: TestDbDefaultsMin = new TestDbDefaultsMin();
      try {
        const writtenRow = await minDao.insert(writeRow);
        const readRow = await fullDao.selectById({ id: writtenRow.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);
        expect(readRow.myString).toBe('sqlite3orm');
        expect(readRow.myReal).toBe(3.1415692);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect update/delete-all to work', async () => {
      const minDao: BaseDAO<TestDbDefaultsMin> = new BaseDAO(TestDbDefaultsMin, sqldb);
      const writeRow: TestDbDefaultsMin = new TestDbDefaultsMin();
      try {
        await fullDao.dropIndex(TEST_UNIQUE_INDEX_NAME);

        const writtenRow = await minDao.insert(writeRow);
        let readRow = await fullDao.selectById({ id: writtenRow.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);

        const updateMyBool = fullDao.queryModel.getUpdateAllStatement(['myBool']);
        await sqldb.run(updateMyBool, { ':myBool': false });

        readRow = await fullDao.selectById({ id: writtenRow.id });
        expect(readRow.myBool).toBe(false);
        expect(readRow.myInt).toBe(42);

        const updateMyBoolAndMyInt = fullDao.queryModel.getUpdateAllStatement(['myBool', 'myInt', 'myBool']);
        await sqldb.run(updateMyBoolAndMyInt, {
          ':myBool': true,
          ':myInt': 99,
        });

        readRow = await fullDao.selectById({ id: writtenRow.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(99);
        const writtenRow2 = await minDao.insert(readRow, BaseDAOInsertMode.ForceAutoGeneration);

        readRow = await fullDao.selectById({ id: writtenRow2.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);

        const deleteAll = fullDao.queryModel.getDeleteAllStatement();
        await sqldb.run(deleteAll + ' where my_integer=:myInt', {
          ':myInt': 99,
        });

        readRow = await fullDao.selectById({ id: writtenRow2.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);

        try {
          readRow = await fullDao.selectById({ id: writtenRow.id });
          failTest(`record should not exist`);
        } catch (e) {}
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect default-clause to work: using partial insert and empty partial model (autoincrement)', async () => {
      try {
        const insertedPartial = await fullDao.insertPartial({
          notMapped: 'foo',
        });
        const readRow = await fullDao.selectById({
          id: insertedPartial.id,
          notMapped: 'foo',
        });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);
        expect(readRow.myString).toBe('sqlite3orm');
        expect(readRow.myReal).toBe(3.1415692);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect partial update to fail for empty partial model', async () => {
      let insertedPartial: Partial<TestDbDefaultsFull>;
      try {
        insertedPartial = await fullDao.insertPartial({});
      } catch (err) {
        failTest(err);
        return;
      }
      try {
        await fullDao.updatePartial({ notMapped: 'foo' });
        failTest('should have thrown');
      } catch (err) {}
    });

    it('expect partial update to fail for only identity properties in partial model', async () => {
      let insertedPartial: Partial<TestDbDefaultsFull>;
      try {
        insertedPartial = await fullDao.insertPartial({});
      } catch (err) {
        failTest(err);
        return;
      }
      try {
        await fullDao.updatePartial({ id: insertedPartial.id });
        failTest('should have thrown');
      } catch (err) {}
    });

    it('expect partial update to succeed for partial model', async () => {
      let insertedPartial: Partial<TestDbDefaultsFull>;
      try {
        insertedPartial = await fullDao.insertPartial({});
        await fullDao.updatePartial({
          id: insertedPartial.id,
          myBool: false,
          myString: 'foo',
        });
        const readRow = await fullDao.selectById({ id: insertedPartial.id });
        expect(readRow.myBool).toBe(false);
        expect(readRow.myInt).toBe(42);
        expect(readRow.myString).toBe('foo');
        expect(readRow.myReal).toBe(3.1415692);
      } catch (err) {
        failTest(err);
      }
    });

    it('expect partial update to succeed for full model', async () => {
      let insertedPartial: Partial<TestDbDefaultsFull>;
      try {
        insertedPartial = await fullDao.insertPartial({});
        const readRow = await fullDao.selectById({ id: insertedPartial.id });
        readRow.myBool = false;
        readRow.myInt = readRow.myInt || 0;
        readRow.myInt += insertedPartial.id as number;
        readRow.notMapped = 'foo';
        await fullDao.updatePartial(readRow);
        const readRow2 = await fullDao.selectById({ id: insertedPartial.id });
        expect(readRow2.myBool).toBe(false);
        expect(readRow2.myInt).toBe(42 + (insertedPartial.id as number));
      } catch (err) {
        failTest(err);
      }
    });

    it('expect update/delete all (without condition) to succeed for partial model', async () => {
      let insertedPartial: Partial<TestDbDefaultsFull>;
      try {
        insertedPartial = await fullDao.insertPartial({});
        insertedPartial.myInt = 59;
        await fullDao.updatePartialAll({
          myInt: insertedPartial.myInt,
          notMapped: 'foo',
        });
        const readRow = await fullDao.selectById({ id: insertedPartial.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(59);
        expect(readRow.myString).toBe('sqlite3orm');
        expect(readRow.myReal).toBe(3.1415692);
        await fullDao.deleteAll();
        try {
          insertedPartial.myBool = false;
          await fullDao.updatePartial({
            id: insertedPartial.id,
            myBool: insertedPartial.myBool,
          });
          failTest(`update should have failed`);
        } catch (err) {}
      } catch (err) {
        failTest(err);
      }
    });

    it('expect update/delete all (with condition) to succeed for partial model', async () => {
      let insertedPartial: Partial<TestDbDefaultsFull>;
      try {
        insertedPartial = await fullDao.insertPartial({});
        insertedPartial.myInt = 59;
        await fullDao.updatePartialAll({ myInt: insertedPartial.myInt }, 'where ID=:id', {
          ':id': insertedPartial.id,
        });
        const readRow = await fullDao.selectById({ id: insertedPartial.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(59);
        expect(readRow.myString).toBe('sqlite3orm');
        expect(readRow.myReal).toBe(3.1415692);
        await fullDao.deleteAll('where ID=:id', { ':id': insertedPartial.id });
        try {
          insertedPartial.myBool = false;
          await fullDao.updatePartial({
            id: insertedPartial.id,
            myBool: insertedPartial.myBool,
          });
          failTest(`update should have failed`);
        } catch (err) {}
      } catch (err) {
        failTest(err);
      }
    });

    it('expect update/delete all to fail if nothing changed', async () => {
      let insertedPartial: Partial<TestDbDefaultsFull> = new TestDbDefaultsFull();
      try {
        await fullDao.createTable();

        insertedPartial = await fullDao.insertPartial({});
        insertedPartial.myInt = 59;
      } catch (err) {
        failTest(err);
      }
      try {
        await fullDao.updatePartialAll({ myInt: insertedPartial.myInt }, 'where ID=:id', {
          ':id': (insertedPartial.id as number) + 1,
        });
        failTest('updateAll should have failed');
      } catch (err) {
        expect((err as Error).message).toContain('nothing changed');
      }
      try {
        await fullDao.deleteAll('where ID=:id', {
          ':id': (insertedPartial.id as number) + 1,
        });
        failTest('deleteAll should have failed');
      } catch (err) {
        expect((err as Error).message).toContain('nothing changed');
      }
    });

    // ---------------------------------------------
    it('expect default-clause to work: using insertOrReplace and empty partial model (autoincrement)', async () => {
      try {
        const insertedPartial = await fullDao.replacePartial({
          notMapped: 'foo',
        });
        const readRow = await fullDao.selectById({
          id: insertedPartial.id,
          notMapped: 'foo',
        });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);
        expect(readRow.myString).toBe('sqlite3orm');
        expect(readRow.myReal).toBe(3.1415692);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect insertOrReplace to insert', async () => {
      try {
        const model = new TestDbDefaultsFull();
        model.myBool = false;
        model.myInt = 31;
        model.myString = 'foo';
        model.myReal = 3.14;
        await fullDao.replace(model);

        const readRow = await fullDao.selectById({ id: model.id });
        expect(readRow.myBool).toBe(false);
        expect(readRow.myInt).toBe(31);
        expect(readRow.myString).toBe('foo');
        expect(readRow.myReal).toBe(3.14);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect insertOrReplace to replace (by id)', async () => {
      try {
        const model = new TestDbDefaultsFull();
        model.myBool = false;
        model.myInt = 31;
        model.myString = 'foo';
        model.myReal = 3.14;

        expect(model.id).toBeUndefined();
        await fullDao.replace(model); // insert using autoincrement
        expect(model.id).toBeDefined();

        const firstId = model.id;
        let readRow = await fullDao.selectById({ id: firstId });
        expect(readRow.myBool).toBe(false);
        expect(readRow.myInt).toBe(31);
        expect(readRow.myString).toBe('foo');
        expect(readRow.myReal).toBe(3.14);

        model.myBool = true;
        model.myInt = 32;
        model.myString = 'foo2';
        model.myReal = 3.15;
        await fullDao.replace(model); // replace
        expect(model.id).toBe(firstId);

        readRow = await fullDao.selectById({ id: model.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(32);
        expect(readRow.myString).toBe('foo2');
        expect(readRow.myReal).toBe(3.15);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect insertOrReplace to replace (by unique index)', async () => {
      try {
        const model = new TestDbDefaultsFull();
        model.myBool = false;
        model.myInt = 31;
        model.myString = 'foo';
        model.myReal = 3.14;

        expect(model.id).toBeUndefined();
        await fullDao.replace(model); // insert using autoincrement
        expect(model.id).toBeDefined();

        const firstId = model.id;
        const readRow = await fullDao.selectById({ id: firstId });
        expect(readRow.myBool).toBe(false);
        expect(readRow.myInt).toBe(31);
        expect(readRow.myString).toBe('foo');
        expect(readRow.myReal).toBe(3.14);

        model.id = undefined as unknown as number;
        model.myBool = true;
        model.myInt = 32;
        model.myString = 'foo';
        model.myReal = 3.15;
        await fullDao.replace(model); // replace
        const secondId = model.id;
        expect(secondId).toBeGreaterThan(firstId);

        const readRows = await fullDao.selectAll();
        expect(readRows.length).toBe(1);
        expect(readRows[0].myBool).toBe(true);
        expect(readRows[0].myInt).toBe(32);
        expect(readRows[0].myString).toBe('foo');
        expect(readRows[0].myReal).toBe(3.15);
      } catch (err) {
        failTest(err);
      }
    });
  });

  describe('BaseDAO insert without autoincrement', () => {
    let sqldb: SqlDatabase;

    const TEST_DB_DEFAULTS2 = 'BD:TEST_DB_DEFAULTS_TABLE2';
    @table({ name: TEST_DB_DEFAULTS2, autoIncrement: false })
    class TestDbDefaultsFull2 {
      @id({ name: 'id', dbtype: 'INTEGER NOT NULL' })
      id!: number;

      @field({ name: 'my_bool', dbtype: 'TEXT DEFAULT 1' })
      myBool?: boolean;

      @field({ name: 'my_integer', dbtype: 'INTEGER DEFAULT 42' })
      myInt?: number;

      @field({ name: 'my_string', dbtype: "TEXT DEFAULT 'sqlite3orm'" })
      myString?: string;

      @field({ name: 'my_real', dbtype: 'REAL DEFAULT 3.1415692' })
      myReal?: number;

      notMapped?: string;
    }

    // ---------------------------------------------
    beforeEach(async () => {
      try {
        sqldb = new SqlDatabase();
        await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect default-clause to work: using partial insert and empty partial model (no autoincrement)', async () => {
      const fullDao: BaseDAO<TestDbDefaultsFull2> = new BaseDAO(TestDbDefaultsFull2, sqldb);
      try {
        await fullDao.createTable();

        const insertedPartial = await fullDao.insertPartial({ id: 1 });
        const readRow = await fullDao.selectById({ id: insertedPartial.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);
        expect(readRow.myString).toBe('sqlite3orm');
        expect(readRow.myReal).toBe(3.1415692);
      } catch (err) {
        failTest(err);
      }
      try {
        await fullDao.dropTable();
      } catch (err) {
        failTest(err);
      }
    });

    // ---------------------------------------------
    it('expect default-clause to work: using partial insertOrReplace and empty partial model (no autoincrement)', async () => {
      const fullDao: BaseDAO<TestDbDefaultsFull2> = new BaseDAO(TestDbDefaultsFull2, sqldb);
      try {
        await fullDao.createTable();

        const insertedPartial = await fullDao.replacePartial({ id: 1 });
        const readRow = await fullDao.selectById({ id: insertedPartial.id });
        expect(readRow.myBool).toBe(true);
        expect(readRow.myInt).toBe(42);
        expect(readRow.myString).toBe('sqlite3orm');
        expect(readRow.myReal).toBe(3.1415692);
      } catch (err) {
        failTest(err);
      }
      try {
        await fullDao.dropTable();
      } catch (err) {
        failTest(err);
      }
    });
  });
});
