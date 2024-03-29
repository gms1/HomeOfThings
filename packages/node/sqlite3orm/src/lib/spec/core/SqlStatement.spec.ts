/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SQL_MEMORY_DB_PRIVATE, SqlDatabase, SqlStatement } from '../..';
import { failTest } from '../../test';

// ---------------------------------------------

describe('test SqlStatement', () => {
  let sqldb: SqlDatabase;

  // ---------------------------------------------
  beforeEach(async () => {
    try {
      sqldb = new SqlDatabase();
      await sqldb.open(SQL_MEMORY_DB_PRIVATE);
      await sqldb.exec('CREATE TABLE TEST (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, col VARCHAR(50))');
      await sqldb.run('INSERT INTO TEST (id, col) values (:a, :b)', {
        ':a': 0,
        ':b': 'testvalue 0',
      });
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
  it('expect basic prepared dml to succeed', async () => {
    let selStmt: SqlStatement;
    let insStmt: SqlStatement;
    selStmt = await sqldb.prepare('SELECT col FROM TEST WHERE id=?');
    try {
      // prepare insert row
      insStmt = await sqldb.prepare('INSERT INTO TEST (id,col) values(?,?)');
      let row: any;
      // insert id=1 col='testvalue 1'
      const res = await insStmt.run([1, 'testvalue 1']);
      expect(res.changes).toBe(1);
      // select inserted row having id=1
      row = await selStmt.get(1);
      expect(row.col).toBe('testvalue 1');
      await selStmt.reset();
      // select another row having id=0
      row = await selStmt.get(0);
      expect(row.col).toBe('testvalue 0');
      // finalize statements
      await selStmt.finalize();
      await insStmt.finalize();
    } catch (err) {
      failTest(err);
    }
    try {
      // statement is not prepared
      await selStmt.run();
      failTest('"run" should failed on finalized statement');
    } catch (err) {}
    try {
      // statement is not prepared
      await selStmt.get();
      failTest('"get" should failed on finalized statement');
    } catch (err) {}
    // prepare select where id>=?
    selStmt = await sqldb.prepare('SELECT id, col FROM TEST WHERE id>=? ORDER BY id');
    try {
      // select all rows having id>0
      const allRows = await selStmt.all(0);
      expect(allRows.length).toBe(2);
      expect(allRows[0].id).toBe(0);
      expect(allRows[0].col).toBe('testvalue 0');
      expect(allRows[1].id).toBe(1);
      expect(allRows[1].col).toBe('testvalue 1');
    } catch (err) {
      failTest(err);
    }
    try {
      // select all rows having id>0 using callback
      const allRows: any[] = [];
      await selStmt.each(0, (err: any, row: any) => allRows.push(row));
      expect(allRows.length).toBe(2);
      expect(allRows[0].id).toBe(0);
      expect(allRows[0].col).toBe('testvalue 0');
      expect(allRows[1].id).toBe(1);
      expect(allRows[1].col).toBe('testvalue 1');
    } catch (err) {
      failTest(err);
    }
  });

  // ---------------------------------------------
});
