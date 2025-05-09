/* eslint-disable @typescript-eslint/no-explicit-any */
import { SqlDatabase } from './core';
import { MetaModel, Table } from './metadata';
import { Filter, isFilter, QueryModel, TABLEALIAS, Where } from './query';

/**
 * @export
 * @enum
 */
export enum BaseDAOInsertMode {
  /** use the provided value if defined, otherwise let sqlite generate the value automatically */
  StrictSqlite = 1,
  /** prevents the insertion of predefined primary key values; always let sqlite generate a value automatically */
  ForceAutoGeneration = 2,
}
/**
 * @export
 * @interface BaseDAOOptions
 */
export interface BaseDAOOptions {
  insertMode?: BaseDAOInsertMode;
  /**
   * @description if set to `true` resolve 'updatePartialAll' and 'deleteAll' with `0` if nothing changed
   */
  ignoreNoChanges?: boolean;
}

/**
 * @export
 * @class BaseDAO
 * @template T - The class mapped to the base table
 */
export class BaseDAO<T extends object> {
  static options?: BaseDAOOptions;

  readonly type: { new(): T };
  readonly metaModel: MetaModel;
  readonly table: Table;
  readonly sqldb: SqlDatabase;
  readonly queryModel: QueryModel<T>;

  /**
   * Creates an instance of BaseDAO.
   *
   * @param type - The class mapped to the base table
   * @param sqldb - The database connection
   */
  public constructor(type: { new(): T }, sqldb: SqlDatabase) {
    this.type = type;
    this.queryModel = new QueryModel<T>(this.type);
    this.metaModel = this.queryModel.metaModel;
    this.table = this.queryModel.table;
    this.sqldb = sqldb;
  }

  /**
   * insert
   *
   * @param model - A model class instance
   * @returns A promise of the inserted model class instance
   */
  public async insert(model: T, mode?: BaseDAOInsertMode): Promise<T> {
    return this.insertInternal(model, undefined, mode) as Promise<T>;
  }

  /**
   * insert partially - insert only columns mapped to the property keys from the partial input model
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all columns mapped to excluded properties must be nullable or must have a database default value
   *
   * @param input - A model class instance
   * @returns A promise of the inserted model class instance
   */
  public async insertPartial(input: Partial<T>, mode?: BaseDAOInsertMode): Promise<Partial<T>> {
    const keys = Object.keys(input);
    return this.insertInternal(input, keys as (keyof T)[], mode);
  }

  /**
   * replace ( insert or replace )
   *
   * @param model - A model class instance
   * @returns A promise of the inserted or updated model class instance
   */
  public async replace(model: T): Promise<T> {
    return this.insertOrReplaceInternal(model) as Promise<T>;
  }

  /**
   * replace ( insert or replace ) partially
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * on insert: all columns mapped to excluded properties must be nullable or must have a database default value
   * on update: all columns mapped to excluded properties are not affected by this update
   *
   * @param input - A model class instance
   * @returns A promise of the inserted or updated model class instance
   */
  public async replacePartial(input: Partial<T>): Promise<Partial<T>> {
    const keys = Object.keys(input);
    return this.insertOrReplaceInternal(input, keys as (keyof T)[]);
  }

  /**
   * update
   *
   * @param model - A model class instance
   * @returns A promise of the updated model class instance
   */

  public async update(model: T): Promise<T> {
    return this.updateInternal(model) as Promise<T>;
  }

  /**
   * update partially - update only columns mapped to the property keys from the partial input model
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all other columns are not affected by this update
   *
   * @param input - A model class instance
   * @returns A promise of the updated model class instance
   */
  public async updatePartial(input: Partial<T>): Promise<Partial<T>> {
    const keys = Object.keys(input);
    return this.updateInternal(input, keys as (keyof T)[]);
  }

  /**
   * update all - please provide a proper sql-condition otherwise all records will be updated!
   * this updates only columns mapped to the property keys from the partial input model
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all other columns are not affected by this update
   *
   * @param input - A model class instance
   * @param [where] - An optional Where-object or sql-text which will be added to the update-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the updated model class instance
   */
  public async updatePartialAll(input: Partial<T>, where?: Where<T>, params?: object): Promise<number> {
    try {
      const keys = Object.keys(input);
      let sql = this.queryModel.getUpdateAllStatement(keys as (keyof T)[]);
      params = Object.assign({}, this.queryModel.bindAllInputParams(input, keys as (keyof T)[]), params);
      const whereClause = await this.queryModel.getWhereClause(this.toFilter(where), params);
      sql += `  ${whereClause}`;
      const res = await this.sqldb.run(sql, params);
      if (!res.changes && !BaseDAO.options?.ignoreNoChanges) {
        return Promise.reject(new Error(`update '${this.table.name}' failed: nothing changed`));
      }
      return res.changes;
    } catch (e /* istanbul ignore next */) {
      return Promise.reject(new Error(`update '${this.table.name}' failed: ${(e as Error).message}`));
    }
  }

  /**
   * delete using primary key
   *
   * @param model - A model class instance
   * @returns A promise
   */
  public delete(model: T): Promise<void> {
    return this.deleteById(model);
  }

  /**
   * delete using primary key
   *
   * @param input - A partial model class instance
   * @returns A promise
   */
  public async deleteById(input: Partial<T>): Promise<void> {
    try {
      const res = await this.sqldb.run(this.queryModel.getDeleteByIdStatement(), this.queryModel.bindPrimaryKeyInputParams(input));
      if (!res.changes) {
        return Promise.reject(new Error(`delete from '${this.table.name}' failed: nothing changed`));
      }
    } catch (e) {
      // NOTE: should not happen
      /* istanbul ignore next */
      return Promise.reject(new Error(`delete from '${this.table.name}' failed: ${(e as Error).message}`));
    }
  }

  /**
   * delete all - please provide a proper sql-condition otherwise all records will be deleted!
   *
   * @param [where] - An optional Where-object or sql-text which will be added to the delete-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise
   */
  public async deleteAll(where?: Where<T>, params?: object): Promise<number> {
    try {
      let sql = this.queryModel.getDeleteAllStatement();
      params = Object.assign({}, params);
      const whereClause = await this.queryModel.getWhereClause(this.toFilter(where), params);
      sql += `  ${whereClause}`;
      const res = await this.sqldb.run(sql, params);
      if (!res.changes && !BaseDAO.options?.ignoreNoChanges) {
        return Promise.reject(new Error(`delete from '${this.table.name}' failed: nothing changed`));
      }
      return Promise.resolve(res.changes);
    } catch (e /* istanbul ignore next */) {
      return Promise.reject(new Error(`delete from '${this.table.name}' failed: ${(e as Error).message}`));
    }
  }

  /**
   * Select a given model
   *
   * @param model - The input/output model
   * @returns A promise of the model instance
   */
  public select(model: T): Promise<T> {
    return this.queryModel.selectModel(this.sqldb, model);
  }

  /**
   * select using primary key
   *
   * @param input - A partial model class instance
   * @returns A promise of the model instance
   */
  public selectById(input: Partial<T>): Promise<T> {
    return this.queryModel.selectModelById(this.sqldb, input);
  }

  /**
   * select parent by using a foreign key constraint and a given child instance
   *
   * @template C - The class mapped to the child table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param childType - The class mapped to the childtable
   * @param childObj - An instance of the class mapped to the child table
   * @returns A promise of model instance
   */
  public async selectByChild<C extends object>(constraintName: string, childType: { new(): C }, childObj: C): Promise<T> {
    // create child DAO
    const childDAO = new BaseDAO<C>(childType, this.sqldb);
    let output: T;
    try {
      // get child properties
      const fkProps = childDAO.queryModel.getForeignKeyProps(constraintName);
      const cols = childDAO.queryModel.getForeignKeyRefCols(constraintName);
      /* istanbul ignore if */
      if (!fkProps || !cols) {
        throw new Error(`in '${childDAO.metaModel.name}': constraint '${constraintName}' is not defined`);
      }
      const refNotFoundCols: string[] = [];

      // get parent (our) properties
      const props = this.queryModel.getPropertiesFromColumnNames(cols, refNotFoundCols);
      /* istanbul ignore if */
      if (!props || refNotFoundCols.length) {
        const s = '"' + refNotFoundCols.join('", "') + '"';
        throw new Error(`in '${this.metaModel.name}': no property mapped to these fields: ${s}`);
      }
      // bind parameters
      const hostParams: object = {};
      for (let i = 0; i < fkProps.length; ++i) {
        this.queryModel.setHostParamValue(hostParams, props[i], fkProps[i].getDBValueFromModel(childObj));
      }

      // generate statement
      let stmt = this.queryModel.getSelectAllStatement(undefined, TABLEALIAS);
      stmt += '\nWHERE\n  ';
      stmt += props.map((prop) => `${TABLEALIAS}.${prop.field.quotedName}=${prop.getHostParameterName()}`).join(' AND ');

      const row = await this.sqldb.get(stmt, hostParams);
      output = this.queryModel.updateModelFromRow(new this.type(), row);
    } catch (e /* istanbul ignore next */) {
      return Promise.reject(new Error(`select '${this.table.name}' failed: ${(e as Error).message}`));
    }
    return output;
  }

  /**
   * select parent by using a foreign key constraint and a given child instance
   *
   * @template P - The class mapped to the parent table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param parentType - The class mapped to the parent table
   * @param childObj - An instance of the class mapped to the child table
   * @returns A promise of model instance
   */
  public selectParentOf<P extends object>(constraintName: string, parentType: { new(): P }, childObj: T): Promise<P> {
    const parentDAO = new BaseDAO<P>(parentType, this.sqldb);
    return parentDAO.selectByChild(constraintName, this.type, childObj);
  }

  /**
   * Select one model using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the selected model instance; rejects if result is not exactly one row
   */
  public selectOne(whereOrFilter?: Where<T> | Filter<T>, params?: object): Promise<T> {
    return this.queryModel.selectOne(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
  }

  /**
   * Select all models using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  public selectAll(whereOrFilter?: Where<T> | Filter<T>, params?: object): Promise<T[]> {
    return this.queryModel.selectAll(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
  }

  /**
   * Count all models using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the count value
   */
  public countAll(whereOrFilter?: Where<T> | Filter<T>, params?: object): Promise<number> {
    return this.queryModel.countAll(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
  }

  /**
   * check if model exist using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the count value
   */
  public exists(whereOrFilter?: Where<T> | Filter<T>, params?: object): Promise<boolean> {
    return this.queryModel.exists(this.sqldb, this.toFilter(whereOrFilter, TABLEALIAS), params);
  }

  /**
   * Select all partial models using a filter
   *
   * @param filter - A Filter-object
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  public selectPartialAll(filter: Filter<T>, params?: object): Promise<Partial<T>[]> {
    return this.queryModel.selectPartialAll(this.sqldb, filter, params);
  }

  /**
   * select all childs using a foreign key constraint and a given parent instance
   *
   * @template P - The class mapped to the parent table
   * @param constraintName - The foreign key constraint
   * @param parentType - The class mapped to the parent table
   * @param parentObj - An instance of the class mapped to the parent table
   * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  public async selectAllOf<P extends object>(constraintName: string, parentType: { new(): P }, parentObj: P, whereOrFilter?: Where<T> | Filter<T>, params?: object): Promise<T[]> {
    try {
      const fkPredicates = this.queryModel.getForeignKeyPredicates(constraintName);
      if (!fkPredicates) {
        throw new Error(`constraint '${constraintName}' is not defined`);
      }
      let stmt = this.queryModel.getSelectAllStatement(undefined, TABLEALIAS);
      stmt += '\nWHERE\n';
      stmt += `  ${TABLEALIAS}.` + fkPredicates.join(` AND ${TABLEALIAS}.`);

      if (whereOrFilter) {
        stmt += ' ';
        stmt += whereOrFilter;
      }
      const parentDAO = new BaseDAO<P>(parentType, this.sqldb);
      const childParams = this.queryModel.bindForeignParams(parentDAO.queryModel, constraintName, parentObj, params);

      const rows: any[] = await this.sqldb.all(stmt, childParams);
      const results: T[] = [];
      rows.forEach((row) => {
        results.push(this.queryModel.updateModelFromRow(new this.type(), row));
      });
      return results;
    } catch (e) {
      return Promise.reject(new Error(`select '${this.table.name}' failed: ${(e as Error).message}`));
    }
  }

  /**
   * select all childs using a foreign key constraint and a given parent instance
   *
   * @template C - The class mapped to the child table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param childType - The class mapped to the childtable
   * @param parentObj - An instance of the class mapped to the parent table
   * @param [where] - An optional Where/Filter-object or sql-text which will be added to the select-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  public selectAllChildsOf<C extends object>(constraintName: string, childType: { new(): C }, parentObj: T, where?: string, params?: object): Promise<C[]> {
    const childDAO = new BaseDAO<C>(childType, this.sqldb);
    return childDAO.selectAllOf(constraintName, this.type, parentObj, where, params);
  }

  /**
   * perform:
   * select T.<col1>,.. FROM <table> T
   *
   * @param callback - The callback called for each row
   * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
   *                     e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise
   */
  public async selectEach(callback: (err: Error, model: T) => void, whereOrFilter?: Where<T> | Filter<T>, params?: object): Promise<number> {
    return this.queryModel.selectEach(this.sqldb, callback, this.toFilter(whereOrFilter, TABLEALIAS), params);
  }

  /**
   * create a table in the database
   *
   * @returns {Promise<void>}
   */
  public createTable(force?: boolean): Promise<void> {
    return this.sqldb.exec(this.table.getCreateTableStatement(force));
  }

  /**
   * drop a table from the database
   *
   * @returns {Promise<void>}
   */
  public dropTable(): Promise<void> {
    return this.sqldb.exec(this.table.getDropTableStatement());
  }

  /**
   * add a column/field to a database table
   *
   * @param colName - The column/field to add
   * @returns A promise
   */
  public alterTableAddColumn(colName: string): Promise<void> {
    return this.sqldb.exec(this.table.getAlterTableAddColumnStatement(colName));
  }

  /**
   * create index in the database
   *
   * @param idxName - The name of the index
   * @param [unique] - create unique index
   * @returns A promise
   */
  public createIndex(idxName: string, unique?: boolean): Promise<void> {
    return this.sqldb.exec(this.table.getCreateIndexStatement(idxName, unique));
  }

  /**
   * drop an index from the database
   *
   * @param idxName - The name of the index
   * @returns A promise
   */
  public dropIndex(idxName: string): Promise<void> {
    return this.sqldb.exec(this.table.getDropIndexStatement(idxName));
  }

  protected toFilter(whereOrFilter?: Where<T> | Filter<T>, tableAlias?: string): Filter<T> {
    if (whereOrFilter && isFilter(whereOrFilter)) {
      return whereOrFilter;
    }
    return { where: whereOrFilter as Where<T>, tableAlias };
  }

  private async insertInternal<K extends keyof T>(input: Partial<T>, keys?: K[], mode?: BaseDAOInsertMode): Promise<Partial<T>> {
    try {
      const insertMode = mode || BaseDAO.options?.insertMode;
      const stmt = this.queryModel.getInsertIntoStatement(keys);
      const params: any = this.queryModel.bindAllInputParams(input, keys);
      const idProperty = this.table.rowIdField ? this.metaModel.mapColNameToProp.get(this.table.rowIdField.name) : undefined;
      if (idProperty && idProperty.getDBValueFromModel(input) != undefined) {
        if ((insertMode === undefined && this.table.autoIncrementField) || insertMode === BaseDAOInsertMode.ForceAutoGeneration) {
          params[idProperty.getHostParameterName()] = null;
        }
      }
      const res: any = await this.sqldb.run(stmt, params);
      if (idProperty) {
        /* istanbul ignore if */
        if (res.lastID == undefined) {
          // NOTE: should not happen
          const operation = this.table.autoIncrementField ? 'AUTOINCREMENT' : 'ROWID';
          return Promise.reject(new Error(`insert into '${this.table.name}' using ${operation} failed: 'lastID' is null or undefined`));
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        res[this.table.rowIdField!.name] = res.lastID;
        /* istanbul ignore else */
        idProperty.setDBValueIntoModel(input, res.lastID);
      }
    } catch (e /* istanbul ignore next */) {
      return Promise.reject(new Error(`insert into '${this.table.name}' failed: ${(e as Error).message}`));
    }
    return input;
  }

  private async insertOrReplaceInternal<K extends keyof T>(input: Partial<T>, keys?: K[]): Promise<Partial<T>> {
    try {
      const res: any = await this.sqldb.run(this.queryModel.getInsertOrReplaceStatement(keys), this.queryModel.bindAllInputParams(input, keys));
      if (this.table.autoIncrementField) {
        /* istanbul ignore if */
        if (res.lastID == undefined) {
          // NOTE: should not happen
          return Promise.reject(new Error("replace into '${this.table.name}' failed: autoincrement failed"));
        }
        const autoProp = this.metaModel.mapColNameToProp.get(this.table.autoIncrementField.name);
        /* istanbul ignore else */
        if (autoProp) {
          autoProp.setDBValueIntoModel(input, res.lastID);
        }
      }
    } catch (e /* istanbul ignore next */) {
      return Promise.reject(new Error(`replace into '${this.table.name}' failed: ${(e as Error).message}`));
    }
    return input;
  }

  private async updateInternal<K extends keyof T>(input: Partial<T>, keys?: K[]): Promise<Partial<T>> {
    try {
      const res = await this.sqldb.run(this.queryModel.getUpdateByIdStatement(keys), this.queryModel.bindAllInputParams(input, keys, true));
      if (!res.changes) {
        return Promise.reject(new Error(`update '${this.table.name}' failed: nothing changed`));
      }
    } catch (e) {
      return Promise.reject(new Error(`update '${this.table.name}' failed: ${(e as Error).message}`));
    }
    return input;
  }
}

// BaseDAO.options = { insertMode: BaseDAOInsertMode.StrictSqlite };
// BaseDAO.options = { insertMode: BaseDAOInsertMode.ForceAutoGeneration };
