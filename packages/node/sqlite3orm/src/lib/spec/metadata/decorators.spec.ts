/* eslint-disable no-empty */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, fk, id, index, table } from '../..';
import { failTest } from '../../test';

// ---------------------------------------------

describe('test decorators', () => {
  // ---------------------------------------------
  it('expect decorating class twice for same table to throw', () => {
    try {
      @table({ name: 'D:TABLE1_FOR_SAME_CLASS', autoIncrement: true })
      @table({ name: 'D:TABLE1_FOR_SAME_CLASS', autoIncrement: true })
      class ClassUsingDifferentTables {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating class for different tables to throw', () => {
    try {
      @table({ name: 'D:TABLE1_FOR_SAME_CLASS', autoIncrement: true })
      @table({ name: 'D:TABLE2_FOR_SAME_CLASS', autoIncrement: true })
      class ClassUsingDifferentTables {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating static property as field to throw', () => {
    try {
      @table({
        name: 'D:TABLE_USING_STATIC_PROPERTY_FOR_FIELD',
        autoIncrement: true,
      })
      class TableUsingStaticProperyForField {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        static id = 5;
        constructor() {}
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating static property as index to throw', () => {
    try {
      @table({
        name: 'D:TABLE_USING_STATIC_PROPERTY_FOR_INDEX',
        autoIncrement: true,
      })
      class TableUsingStaticProperyForIndex {
        @index('PARENTIDX')
        static parentId?: number;

        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating static property as foreign key to throw', () => {
    try {
      @table({
        name: 'D:TABLE_USING_STATIC_PROPERTY_FOR_FK',
        autoIncrement: true,
      })
      class TableUsingStaticProperyForFk {
        @fk('PARENTIDX', 'ANOTHER_TABLE', 'ANOTHER_FIELD')
        static parentId?: number;

        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating property twice as same field to throw', () => {
    try {
      @table({ name: 'D:TABLE_USING_DUPLICATE_FIELD', autoIncrement: true })
      class TableUsingDuplicateIndexOnField {
        @field({ name: 'PARENTID', dbtype: 'INTEGER' })
        parentId?: number;

        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        @field({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating property as different fields to throw', () => {
    try {
      @table({ name: 'D:TABLE_USING_DUPLICATE_FIELD', autoIncrement: true })
      class TableUsingDuplicateIndexOnField {
        @field({ name: 'PARENTID', dbtype: 'INTEGER' })
        parentId?: number;

        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        @field({ name: 'PARENTID', dbtype: 'INTEGER' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating property twice for same index to throw', () => {
    try {
      @table({
        name: 'D:TABLE_USING_DUPLICATE_INDEX_ON_FIELD',
        autoIncrement: true,
      })
      class TableUsingDuplicateIndexOnField {
        @index('PARENTIDX')
        @index('PARENTIDX')
        @field({ name: 'PARENTID', dbtype: 'INTEGER' })
        parentId?: number;

        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });

  // ---------------------------------------------
  it('expect decorating foreign key twice for same constraint name to throw', () => {
    try {
      @table({ name: 'D:PARENT_TABLE_FOR_DUPLICATE_FKS' })
      class ParentTableForDuplicateFKs {
        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
        @id({ name: 'ID2', dbtype: 'INTEGER NOT NULL' })
        id2!: number;
      }

      @table({ name: 'D:TABLE_USING_DUPLICATE_FK', autoIncrement: true })
      class TableUsingDuplicateFKs {
        @fk('PARENTIDX', 'PARENT_TABLE_FOR_DUPLICATE_FKS', 'ID')
        @fk('PARENTIDX', 'PARENT_TABLE_FOR_DUPLICATE_FKS', 'ID2')
        @field({ name: 'PARENTID1', dbtype: 'INTEGER' })
        parentId1?: number;

        @id({ name: 'ID', dbtype: 'INTEGER NOT NULL' })
        id!: number;
      }
      failTest('should have thrown');
    } catch (err) {}
  });
});
