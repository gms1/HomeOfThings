/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AutoUpgrader,
  DbCatalogDAO,
  DbTableInfo,
  field,
  id,
  METADATA_MODEL_KEY,
  MetaModel,
  schema,
  SQL_DEFAULT_SCHEMA,
  SQL_MEMORY_DB_PRIVATE,
  SqlDatabase,
  Table,
  table,
  UpgradeInfo,
} from '..';
import { UpgradeMode, UpgradeOptions } from '../AutoUpgrader';
import { fk, index } from '../metadata/decorators';
import { failTest } from '../test';

const TEST_TABLE = 'AU:TABLE';
const TEST_PARENT_TABLE = 'AU:PARENT_TABLE';

function debug(formatter: any, ...args: any[]): void {
  AutoUpgrader.debug(formatter, ...args);
}

// public methods for easier testing
class SpecAutoUpgrader extends AutoUpgrader {
  override _getUpgradeInfo(tab: Table, tableInfo?: DbTableInfo, opts?: UpgradeOptions): UpgradeInfo {
    return super._getUpgradeInfo(tab, tableInfo, opts);
  }
}

// ---------------------------------------------

describe('test autoupgrade - upgrade info', () => {
  let sqldb: SqlDatabase;
  let autoUpgrader: SpecAutoUpgrader;
  let catalogDao: DbCatalogDAO;
  const tableInfo: DbTableInfo = {
    name: TEST_TABLE,
    tableName: TEST_TABLE,
    schemaName: SQL_DEFAULT_SCHEMA,
    autoIncrement: true,
    columns: {
      ID: {
        name: 'ID',
        typeAffinity: 'INTEGER',
        type: 'INT',
        notNull: true,
        defaultValue: null,
      },

      PARENT1_ID1: {
        name: 'PARENT1_ID1',
        typeAffinity: 'INTEGER',
        type: 'INT',
        notNull: false,
        defaultValue: null,
      },
      PARENT1_ID2: {
        name: 'PARENT1_ID2',
        typeAffinity: 'INTEGER',
        type: 'INT',
        notNull: false,
        defaultValue: null,
      },

      PARENT2_ID1: {
        name: 'PARENT2_ID1',
        typeAffinity: 'INTEGER',
        type: 'INT',
        notNull: false,
        defaultValue: null,
      },
      PARENT2_ID2: {
        name: 'PARENT2_ID2',
        typeAffinity: 'INTEGER',
        type: 'INT',
        notNull: false,
        defaultValue: null,
      },

      PARENT3_ID1: {
        name: 'PARENT3_ID1',
        typeAffinity: 'INTEGER',
        type: 'INT',
        notNull: false,
        defaultValue: null,
      },
      PARENT3_ID2: {
        name: 'PARENT3_ID2',
        typeAffinity: 'INTEGER',
        type: 'INT',
        notNull: false,
        defaultValue: null,
      },

      FLD1: {
        name: 'FLD1',
        typeAffinity: 'TEXT',
        type: 'CHAR',
        notNull: false,
        defaultValue: null,
      },
      FLD2: {
        name: 'FLD2',
        typeAffinity: 'TEXT',
        type: 'CHAR',
        notNull: true,
        defaultValue: null,
      },
      FLD3: {
        name: 'FLD3',
        typeAffinity: 'TEXT',
        type: 'CHAR',
        notNull: true,
        defaultValue: "'foo'",
      },
      FLD4: {
        name: 'FLD4',
        typeAffinity: 'REAL',
        type: 'DOUBLE',
        notNull: true,
        defaultValue: '3.14',
      },
      FLD5: {
        name: 'FLD5',
        typeAffinity: 'TEXT',
        type: 'CHAR',
        notNull: true,
        defaultValue: "'foo'",
      },
    },
    primaryKey: ['ID'],
    indexes: {
      IDX_PARENT2: {
        name: 'IDX_PARENT2',
        unique: false,
        partial: false,
        columns: [
          { name: 'PARENT2_ID1', desc: false, coll: '', key: true },
          { name: 'PARENT2_ID2', desc: false, coll: '', key: true },
        ],
      },
      IDX_PARENT3: {
        name: 'IDX_PARENT3',
        unique: false,
        partial: false,
        columns: [
          { name: 'PARENT3_ID1', desc: false, coll: '', key: true },
          { name: 'PARENT3_ID2', desc: false, coll: '', key: true },
        ],
      },
    },
    foreignKeys: {
      '(PARENT1_ID1,PARENT1_ID2) => AU:PARENT_TABLE(ID1,ID2)': {
        refTable: TEST_PARENT_TABLE,
        columns: ['PARENT1_ID1', 'PARENT1_ID2'],
        refColumns: ['ID1', 'ID2'],
      },
      '(PARENT2_ID1,PARENT2_ID2) => AU:PARENT_TABLE(ID1,ID2)': {
        refTable: TEST_PARENT_TABLE,
        columns: ['PARENT2_ID1', 'PARENT2_ID2'],
        refColumns: ['ID1', 'ID2'],
      },
    },
  };

  // ---------------------------------------------
  beforeEach(async () => {
    try {
      sqldb = new SqlDatabase();
      autoUpgrader = new SpecAutoUpgrader(sqldb);
      catalogDao = new DbCatalogDAO(sqldb);

      await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      await autoUpgrader.foreignKeyEnable(true);
      schema().deleteTable(TEST_TABLE);
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
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('actual', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.ACTUAL);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('create', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.CREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('forced recreate', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo, {
        forceRecreate: true,
      }); // !!! <= forced recreate

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate because of added/removed foreign key', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        @fk('FK_PARENT3', TEST_PARENT_TABLE, 'ID1') // !!! <= added foreign key
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        @fk('FK_PARENT3', TEST_PARENT_TABLE, 'ID2') // !!! <= added foreign key
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate because of changed foreign key', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2') // !!! <= changed foreign key
        parent1Id2?: number;
        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1') // !!! <= changed foreign key
        parent1Id1?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate because of dropped column', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate and keep dropped not-null column', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo, {
        keepOldColumns: true,
      }); // !!! <= keep

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('actual because of kept dropped nullable column', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        // @field({name: 'FLD1', dbtype: 'TEXT'})  // !!! <= dropped nullable column
        // fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo, {
        keepOldColumns: true,
      }); // !!! <= keep

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.ACTUAL);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate because of changed column', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: 'REAL NOT NULL DEFAULT 3.14' }) // !!! <= changed column
        fld5?: number;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate because of primary key removed', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        // @id({name: 'ID', dbtype: 'INTEGER NOT NULL'}) // !!! <= primary key removed
        @field({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate because of primary key changed', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        // @id({name: 'ID', dbtype: 'INTEGER NOT NULL'}) // !!! <= primary key changed
        @field({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @id({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' }) // !!! <= primary key changed
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('recreate because of autoincrement changed', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: false }) // !!! <= autoIncrement changed
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.RECREATE);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('alter because of added column', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;

        @field({ name: 'FLD6', dbtype: 'TEXT' }) // !!! <= added column
        fld6?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.ALTER);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('alter because of added index', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT1') // !!! <= added index
        parent1Id1?: number;
        @index('IDX_PARENT1') // !!! <= added index
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2')
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2')
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.ALTER);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('alter because of added and dropped index', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT1') // !!! <= added index
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT1') // !!! <= added index
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        // @index('IDX_PARENT2') // !!! <= dropped index
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        // @index('IDX_PARENT2') // !!! <= dropped index
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.ALTER);
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('alter because of changed index', async () => {
    try {
      @table({ name: TEST_PARENT_TABLE })
      class ParentModel {
        @id({ name: 'ID1', dbtype: 'INTEGER NOT NULL' })
        id1!: number;

        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: TEST_TABLE, autoIncrement: true })
      class Model1 {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;

        @field({ name: 'PARENT1_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID1')
        @index('IDX_PARENT2') // !!! <= changed index
        parent1Id1?: number;
        @field({ name: 'PARENT1_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT1', TEST_PARENT_TABLE, 'ID2')
        @index('IDX_PARENT2') // !!! <= changed index
        parent1Id2?: number;

        @field({ name: 'PARENT2_ID1', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID1')
        // @index('IDX_PARENT2') // !!! <= changed index
        parent2Id1?: number;
        @field({ name: 'PARENT2_ID2', dbtype: 'INTEGER' })
        @fk('FK_PARENT2', TEST_PARENT_TABLE, 'ID2')
        // @index('IDX_PARENT2') // !!! <= changed index
        parent2Id2?: number;

        @field({ name: 'PARENT3_ID1', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id1?: number;
        @field({ name: 'PARENT3_ID2', dbtype: 'INTEGER' })
        @index('IDX_PARENT3')
        parent3Id2?: number;

        @field({ name: 'FLD1', dbtype: 'TEXT' })
        fld1?: string;

        @field({ name: 'FLD2', dbtype: 'TEXT NOT NULL' })
        fld2?: string;

        @field({ name: 'FLD3', dbtype: "TEXT NOT NULL DEFAULT 'foo'" })
        fld3?: string;

        @field({ name: 'FLD4', dbtype: 'REAL NOT NULL DEFAULT 3.14' })
        fld4?: number;

        @field({ name: 'FLD5', dbtype: "TEXT NOT NULL DEFAULT('foo')" })
        fld5?: string;
      }

      const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, Model1.prototype) as MetaModel;

      const upgradeInfo = autoUpgrader._getUpgradeInfo(metaModel.table, tableInfo);

      expect(upgradeInfo).toBeDefined();
      expect(upgradeInfo.upgradeMode).toBe(UpgradeMode.ALTER);
    } catch (err) {
      failTest(err);
    }
  });
});
