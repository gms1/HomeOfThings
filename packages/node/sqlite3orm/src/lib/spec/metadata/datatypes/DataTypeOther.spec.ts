import { BaseDAO, field, id, schema, SQL_MEMORY_DB_PRIVATE, SqlDatabase, table, ValueTransformer } from '../../..';
import { failTest } from '../../../test';

const DATATYPE_OTHER_TABLE = 'DJ:DATATYPE_NUMBER';

const testTransformer: ValueTransformer = {
  toDB: (input) => (input == undefined ? null : input.toFixed(2)),
  fromDB: (input) => (input == null ? undefined : Number(input)),
};

@table({ name: DATATYPE_OTHER_TABLE, autoIncrement: true })
class DataTypeOther {
  @id({ name: 'id', dbtype: 'INTEGER NOT NULL' })
  id!: number;

  @field({ name: 'my_number_text', dbtype: 'TEXT' })
  myNumberText?: number;

  @field({ name: 'my_string_real', dbtype: 'INTEGER' })
  myStringInteger?: string;

  @field({
    name: 'my_number_text2',
    dbtype: 'TEXT',
    transform: testTransformer,
  })
  myNumberText2?: number;
}

describe('test Json data', () => {
  let sqldb: SqlDatabase;
  let dao: BaseDAO<DataTypeOther>;
  // ---------------------------------------------
  beforeEach(async () => {
    try {
      sqldb = new SqlDatabase();
      await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      await schema().createTable(sqldb, DATATYPE_OTHER_TABLE);
      dao = new BaseDAO<DataTypeOther>(DataTypeOther, sqldb);
      const prop = dao.metaModel.getProperty('myNumberText2');
      expect(prop.transform.toDB).toBe(testTransformer.toDB);
      expect(prop.transform.fromDB).toBe(testTransformer.fromDB);
    } catch (err) {
      failTest(err);
    }
  });

  it('expect reading/writing number/string properties from/to the database as text/real to succeed', async () => {
    try {
      // write
      const model: DataTypeOther = new DataTypeOther();
      model.myNumberText = 3.14;
      model.myStringInteger = '42';
      model.myNumberText2 = 3.149;
      await dao.insert(model);

      // read
      const model2: DataTypeOther = await dao.select(model);

      expect(model2.id).toBe(model.id);
      expect(model2.myNumberText).toBe(3.14);
      expect(model2.myStringInteger).toBe('42');
      expect(model2.myNumberText2).toBe(3.15);
    } catch (err) {
      failTest(err);
    }
  });

  it('expect reading/writing undefined properties from/to the database as text/real to succeed', async () => {
    try {
      // write
      const model: DataTypeOther = new DataTypeOther();
      await dao.insert(model);

      // read
      const model2: DataTypeOther = await dao.select(model);
      expect(model2.id).toBe(model.id);
      expect(model2.myNumberText).toBeUndefined();
      expect(model2.myStringInteger).toBeUndefined();
      expect(model2.myNumberText2).toBeUndefined();
    } catch (err) {
      failTest(err);
    }
  });
});
