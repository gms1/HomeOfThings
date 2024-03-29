/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoUpgrader, BaseDAO, BaseDAOInsertMode, DbCatalogDAO, field, id, schema, SQL_MEMORY_DB_PRIVATE, SqlDatabase, Table, table, UpgradeInfo } from '..';
import { fk, index } from '../metadata/decorators';
import { failTest } from '../test';

const TEST_TABLE = 'AU:TABLE';
const TEST_PARENT_TABLE = 'AU:PARENT_TABLE';

function debug(formatter: any, ...args: any[]): void {
  AutoUpgrader.debug(formatter, ...args);
}

// public methods for easier testing
class SpecAutoUpgrader extends AutoUpgrader {
  override createTable(tab: Table): Promise<void> {
    return super.createTable(tab);
  }
  override alterTable(tab: Table, upgradeInfo: UpgradeInfo): Promise<void> {
    return super.alterTable(tab, upgradeInfo);
  }
  override recreateTable(tab: Table, upgradeInfo: UpgradeInfo): Promise<void> {
    return super.recreateTable(tab, upgradeInfo);
  }
}

// ---------------------------------------------

describe('test autoupgrade', () => {
  let sqldb: SqlDatabase;
  let autoUpgrader: SpecAutoUpgrader;
  let catalogDao: DbCatalogDAO;

  // ---------------------------------------------
  beforeEach(async () => {
    try {
      sqldb = new SqlDatabase();
      autoUpgrader = new SpecAutoUpgrader(sqldb);
      catalogDao = new DbCatalogDAO(sqldb);

      await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      await autoUpgrader.foreignKeyEnable(true);
      schema().deleteTable(TEST_TABLE);
      schema().deleteTable(TEST_PARENT_TABLE);
      debug('start');
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  afterEach(async () => {
    try {
      debug('end');
      schema().deleteTable(TEST_TABLE);
      schema().deleteTable(TEST_PARENT_TABLE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('should work for newly defined table (CREATE)', async () => {
    try {
      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        content?: string;
      }
      await autoUpgrader.foreignKeyEnable(false);

      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual([model1Dao.table]);
      expect(actual).toBeTruthy();

      const tableDef = schema().getTable(TEST_TABLE);

      const spyRecreate = jest.spyOn(autoUpgrader, 'recreateTable');
      await autoUpgrader.upgradeTables(tableDef, { forceRecreate: true });
      expect(spyRecreate).toHaveBeenCalledTimes(1);

      const fkEnabled = await autoUpgrader.foreignKeyEnabled();
      expect(fkEnabled).toBeFalsy();
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('should work for added nullable column (ALTER)', async () => {
    try {
      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        content?: string;
      }
      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeTruthy();

      const table1Info1 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info1).toBeDefined();
      expect(table1Info1!.columns['CONTENT2']).toBeUndefined();

      schema().deleteTable(TEST_TABLE);
      // --------------------------------------------
      // upgrade
      debug('redefine');

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model2 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT' })
        content2?: string;
      }
      const model2Dao = new BaseDAO<Model2>(Model2, sqldb);

      actual = await autoUpgrader.isActual(model2Dao.table);
      expect(actual).toBeFalsy();

      const spyAlter = jest.spyOn(autoUpgrader, 'alterTable');
      await autoUpgrader.upgradeTables([model2Dao.table]);
      expect(spyAlter).toHaveBeenCalledTimes(1);

      actual = await autoUpgrader.isActual(model2Dao.table);
      expect(actual).toBeTruthy();

      const table1Info2 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info2).toBeDefined();
      expect(table1Info2!.columns['CONTENT2']).toBeDefined();
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('should fail for added not-nullable column without default (ALTER)', async () => {
    try {
      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        content?: string;
      }
      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeTruthy();

      const table1Info1 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info1).toBeDefined();
      expect(table1Info1!.columns['CONTENT2']).toBeUndefined();

      const data = new Model1();
      data.id = 31;
      data.content = 'foo';
      await model1Dao.insert(data);

      schema().deleteTable(TEST_TABLE);
      // --------------------------------------------
      // upgrade
      debug('redefine');

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model2 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT NOT NULL' })
        content2?: string;
      }
      const model2Dao = new BaseDAO<Model2>(Model2, sqldb);

      actual = await autoUpgrader.isActual(model2Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model2Dao.table]);

      actual = await autoUpgrader.isActual(model2Dao.table);
      expect(actual).toBeFalsy();

      failTest(`should have failed: Cannot add a NOT NULL column without default value`);
    } catch (err) {}
  });

  // ---------------------------------------------
  it('should work for deleted column (NOOP, KEEP)', async () => {
    try {
      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT' })
        content2?: string;
      }
      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeTruthy();

      const table1Info1 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info1).toBeDefined();
      expect(table1Info1!.columns['CONTENT2']).toBeDefined();
      expect(table1Info1!.indexes['IDX_CONTENT']).toBeDefined();

      schema().deleteTable(TEST_TABLE);
      // --------------------------------------------
      // upgrade
      debug('redefine');

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model2 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;
      }
      const model2Dao = new BaseDAO<Model2>(Model2, sqldb);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeTruthy();

      const spyCreate = jest.spyOn(autoUpgrader, 'createTable');
      const spyAlter = jest.spyOn(autoUpgrader, 'alterTable');
      const spyRecreate = jest.spyOn(autoUpgrader, 'recreateTable');
      await autoUpgrader.upgradeTables([model2Dao.table], {
        keepOldColumns: true,
      });
      expect(spyCreate).toHaveBeenCalledTimes(0);
      expect(spyAlter).toHaveBeenCalledTimes(0);
      expect(spyRecreate).toHaveBeenCalledTimes(0);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeTruthy();

      const table1Info2 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info2).toBeDefined();
      expect(table1Info2!.columns['CONTENT2']).toBeDefined();
      expect(table1Info2!.indexes['IDX_CONTENT']).toBeDefined();
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('should work for added and deleted columns (ALTER, KEEP)', async () => {
    try {
      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT' })
        content2?: string;
      }

      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeTruthy();

      const table1Info1 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info1).toBeDefined();
      expect(table1Info1!.columns['CONTENT2']).toBeDefined();
      expect(table1Info1!.indexes['IDX_CONTENT']).toBeDefined();

      schema().deleteTable(TEST_TABLE);
      // --------------------------------------------
      // upgrade
      debug('redefine');

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model2 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;

        @field({ name: 'CONTENT3', dbtype: 'TEXT' })
        content3?: string;
      }
      const model2Dao = new BaseDAO<Model2>(Model2, sqldb);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeFalsy();

      const spyAlter = jest.spyOn(autoUpgrader, 'alterTable');
      await autoUpgrader.upgradeTables([model2Dao.table], {
        keepOldColumns: true,
      });
      expect(spyAlter).toHaveBeenCalledTimes(1);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeTruthy();

      const table1Info2 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info2).toBeDefined();
      expect(table1Info2!.columns['CONTENT2']).toBeDefined();
      expect(table1Info2!.indexes['IDX_CONTENT']).toBeDefined();
      expect(table1Info2!.columns['CONTENT3']).toBeDefined();
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('should work for add/remove/change indexes (ALTER)', async () => {
    try {
      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        @index('IDX_KEEP')
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_DROP')
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT' })
        @index('IDX_CHANGE')
        content2?: string;
      }
      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeTruthy();

      const table1Info1 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info1).toBeDefined();
      expect(table1Info1!.columns['CONTENT2']).toBeDefined();
      expect(table1Info1!.indexes['IDX_KEEP']).toBeDefined();
      expect(table1Info1!.indexes['IDX_DROP']).toBeDefined();
      expect(table1Info1!.indexes['IDX_CHANGE']).toBeDefined();
      expect(table1Info1!.indexes['IDX_CHANGE'].columns[0].name).toBe('CONTENT2');

      schema().deleteTable(TEST_TABLE);
      // --------------------------------------------
      // upgrade
      debug('redefine');

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model2 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        @index('IDX_KEEP')
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CHANGE')
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT' })
        @index('IDX_ADD')
        content2?: string;
      }
      const model2Dao = new BaseDAO<Model2>(Model2, sqldb);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeFalsy();

      const spyAlter = jest.spyOn(autoUpgrader, 'alterTable');
      await autoUpgrader.upgradeTables([model2Dao.table], {
        keepOldColumns: true,
      });
      expect(spyAlter).toHaveBeenCalledTimes(1);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeTruthy();

      const table1Info2 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info2).toBeDefined();
      expect(table1Info2!.indexes['IDX_DROP']).toBeUndefined();
      expect(table1Info1!.indexes['IDX_KEEP']).toBeDefined();
      expect(table1Info2!.indexes['IDX_ADD']).toBeDefined();
      expect(table1Info2!.indexes['IDX_CHANGE']).toBeDefined();
      expect(table1Info2!.indexes['IDX_CHANGE'].columns[0].name).toBe('CONTENT');
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('should work for deleted column (RECREATE, NOKEEP)', async () => {
    try {
      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT' })
        content2?: string;
      }
      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual(model1Dao.table);
      expect(actual).toBeTruthy();

      const table1Info1 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info1).toBeDefined();
      expect(table1Info1!.columns['CONTENT2']).toBeDefined();
      expect(table1Info1!.indexes['IDX_CONTENT']).toBeDefined();

      const model1 = new Model1();
      await model1Dao.insert(model1);
      const id1 = model1.id;
      model1.content = 'foo';
      model1.content2 = 'bar';
      await model1Dao.insert(model1, BaseDAOInsertMode.ForceAutoGeneration);
      const id2 = model1.id;

      schema().deleteTable(TEST_TABLE);
      // --------------------------------------------
      // upgrade
      debug('redefine');

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model2 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;
      }
      const model2Dao = new BaseDAO<Model2>(Model2, sqldb);

      actual = await autoUpgrader.isActual(model2Dao.table);
      expect(actual).toBeFalsy();

      const spyRecreate = jest.spyOn(autoUpgrader, 'recreateTable');
      await autoUpgrader.upgradeTables([model2Dao.table]);
      expect(spyRecreate).toHaveBeenCalledTimes(1);

      actual = await autoUpgrader.isActual(model2Dao.table);
      expect(actual).toBeTruthy();

      const table1Info2 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info2).toBeDefined();
      expect(table1Info2!.columns['CONTENT2']).toBeUndefined();
      expect(table1Info2!.indexes['IDX_CONTENT']).toBeDefined();

      let model2 = await model2Dao.selectById({ id: id1 });
      expect(model2.content).toBeUndefined();

      model2 = await model2Dao.selectById({ id: id2 });
      expect(model2.content).toBe('foo');
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('should work for added and deleted columns (RECREATE, KEEP)', async () => {
    // using a dropped foreign key to force recreate
    try {
      @table({ name: TEST_PARENT_TABLE, autoIncrement: true })
      class ParentModel {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;

        @field({ name: 'CONTENT2', dbtype: 'TEXT' })
        content2?: string;

        @field({ name: 'CONTENT3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        content3?: string;

        @field({ name: 'PARENT_ID', dbtype: 'INTEGER' })
        @fk('PARENT', TEST_PARENT_TABLE, 'ID')
        parentId?: number;
      }

      const parentModelDao = new BaseDAO<ParentModel>(ParentModel, sqldb);
      await parentModelDao.createTable();

      const model1Dao = new BaseDAO<Model1>(Model1, sqldb);

      let actual: boolean;
      actual = await autoUpgrader.isActual([model1Dao.table, parentModelDao.table]);
      expect(actual).toBeFalsy();

      await autoUpgrader.upgradeTables([model1Dao.table]);

      actual = await autoUpgrader.isActual([model1Dao.table, parentModelDao.table]);
      expect(actual).toBeTruthy();

      const table1Info1 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info1).toBeDefined();
      expect(table1Info1!.columns['CONTENT2']).toBeDefined();
      expect(table1Info1!.columns['CONTENT3']).toBeDefined();
      expect(table1Info1!.indexes['IDX_CONTENT']).toBeDefined();

      const parentModel = new ParentModel();
      await parentModelDao.insert(parentModel);
      const pId = parentModel.id;

      const model1 = new Model1();
      model1.parentId = undefined;
      model1.content3 = 'blub';
      model1.parentId = pId;
      await model1Dao.insert(model1);
      const id1 = model1.id;
      model1.parentId = undefined;
      model1.content = 'foo';
      model1.content2 = 'bar';
      model1.content3 = 'baz';
      await model1Dao.insert(model1, BaseDAOInsertMode.ForceAutoGeneration);
      const id2 = model1.id;

      schema().deleteTable(TEST_TABLE);
      // --------------------------------------------
      // upgrade
      debug('redefine');

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model2 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'CONTENT', dbtype: 'TEXT' })
        @index('IDX_CONTENT')
        content?: string;

        @field({ name: 'CONTENT4', dbtype: 'TEXT' })
        content4?: string;

        @field({ name: 'PARENT_ID', dbtype: 'INTEGER' })
        parentId?: number;
      }
      const model2Dao = new BaseDAO<Model2>(Model2, sqldb);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeFalsy();

      const spyRecreate = jest.spyOn(autoUpgrader, 'recreateTable');
      await autoUpgrader.upgradeTables([model2Dao.table], {
        keepOldColumns: true,
      });
      expect(spyRecreate).toHaveBeenCalledTimes(1);

      actual = await autoUpgrader.isActual(model2Dao.table, {
        keepOldColumns: true,
      });
      expect(actual).toBeTruthy();

      const table1Info2 = await catalogDao.readTableInfo(TEST_TABLE);
      expect(table1Info2).toBeDefined();
      expect(table1Info2!.columns['CONTENT2']).toBeDefined();
      expect(table1Info2!.columns['CONTENT3']).toBeDefined();
      expect(table1Info2!.indexes['IDX_CONTENT']).toBeDefined();
      expect(table1Info2!.columns['CONTENT4']).toBeDefined();

      let model2 = await model2Dao.selectById({ id: id1 });
      expect(model2.content).toBeUndefined();
      expect(model2.content4).toBeUndefined();
      expect(model2.parentId).toBe(pId);

      model2 = await model2Dao.selectById({ id: id2 });
      expect(model2.content).toBe('foo');
      expect(model2.content4).toBeUndefined();
      expect(model2.parentId).toBeUndefined();
    } catch (err) {
      failTest(err);
    }
  });
});
