/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@homeofthings/nestjs-utils';
import { BaseDAO, BaseDAOInsertMode, Filter, METADATA_MODEL_KEY, MetaModel, SqlDatabase, Table, Where } from 'sqlite3orm';
import { ConnectionManager } from './connection-manager';

export class Repository<T> {
  private readonly table: Table;

  constructor(public readonly type: Type<T>, private _connectionManager: ConnectionManager, private _connectionName: string) {
    const metaModel: MetaModel = Reflect.getMetadata(METADATA_MODEL_KEY, type.prototype);
    if (!metaModel) {
      throw new Error(`no table-definition on prototype of ${type.name}'`);
    }
    ConnectionManager.registerTable(metaModel.table, this._connectionName);
    this.table = metaModel.table;
  }

  get connection(): Promise<SqlDatabase> {
    return this._connectionManager.getConnection(this._connectionName);
  }

  get dao(): Promise<BaseDAO<T>> {
    return this.connection.then((sqlDb) => new BaseDAO<T>(this.type, sqlDb));
  }

  /**
   * test if a row exists using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of true if at least one row exists or false otherwise
   */
  exists(whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<boolean> {
    return this.dao.then((dao) => dao.exists(whereOrFilter, params));
  }

  /**
   * count all rows using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the count number of rows
   */
  count(whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<number> {
    return this.dao.then((dao) => dao.countAll(whereOrFilter, params));
  }

  /**
   * find entity by primary key
   *
   * @param input - A partial instance of the entity class
   * @returns A promise of the entity instance
   */
  findById(input: Partial<T>): Promise<T> {
    return this.dao.then((dao) => dao.selectById(input));
  }

  /**
   * find one entity
   *
   * @param input - A partial instance of the entity class
   * @returns A promise of the entity instance
   */
  findOne(whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T> {
    return this.dao.then((dao) => dao.selectOne(whereOrFilter, params));
  }

  /**
   * find all entities using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of entity instances
   */
  findAll(whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T[]> {
    return this.dao.then((dao) => dao.selectAll(whereOrFilter, params));
  }

  /**
   * find parent entity by using a foreign key constraint and a given child instance
   *
   * @template C - The entity class type mapped to the child table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param childEntity - The entity class value mapped to the childtable
   * @param childObj - An instance of the entity class mapped to the child table
   * @returns A promise of the parent entity instance
   */

  findByChild<C extends Object>(constraintName: string, childEntity: Type<C>, childObj: C): Promise<T> {
    return this.dao.then((dao) => dao.selectByChild(constraintName, childEntity, childObj));
  }

  /**
   * find all child entities using a foreign key constraint and a given parent instance
   *
   * @template P - The entity class type mapped to the parent table
   * @param constraintName - The foreign key constraint
   * @param parentEntity - The entity class value mapped to the parent table
   * @param parentObj - An instance of the entity class mapped to the parent table
   * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of child entity instances
   */
  findAllByParent<P extends Object>(constraintName: string, parentEntity: Type<P>, parentObj: P, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T[]> {
    return this.dao.then((dao) => dao.selectAllOf(constraintName, parentEntity, parentObj, whereOrFilter, params));
  }

  /**
   * find parent by using a foreign key constraint and a given child instance
   *
   * @template P - The entity class type mapped to the parent table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param parentEntity - The entity class value mapped to the parent table
   * @param childObj - An instance of the entity class mapped to the child table
   * @returns A promise of parent entity instance
   */
  findParentOf<P extends Object>(constraintName: string, parentEntity: Type<P>, childObj: T): Promise<P> {
    return this.dao.then((dao) => dao.selectParentOf(constraintName, parentEntity, childObj));
  }

  /**
   * find all childs using a foreign key constraint and a given parent instance
   *
   * @template C - The entity class type mapped to the child table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param childEntity - The entity class value mapped to the childtable
   * @param parentObj - An instance of the class mapped to the parent table
   * @param [where] - An optional sql-text which will be added to the select-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of child entity instances
   */
  findAllChildsOf<C extends Object>(constraintName: string, childEntity: Type<C>, parentObj: T, where?: string, params?: Object): Promise<C[]> {
    return this.dao.then((dao) => dao.selectAllChildsOf(constraintName, childEntity, parentObj, where, params));
  }

  /**
   * save - Saves a given entity.
   * If the given entity does not exist in the database, it will be inserted.
   * If the given entity does exist in he database, it will be updated.
   *
   * @param model - A entity class instance
   * @returns A promise of the inserted or updated entity class instance
   */
  save(model: T): Promise<T> {
    return this.dao.then((dao) => dao.replace(model));
  }

  /**
   * save partially - save (insert or update) only columns mapped to the property keys from the partial input
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * on insert: all columns mapped to excluded properties must be nullable or must have a database default value
   * on update: all columns mapped to excluded properties are not affected by this update
   *
   * @param input - A partial instance of the entity class
   * @returns A promise of the partial instance of the entity class
   */
  savePartial(input: Partial<T>): Promise<Partial<T>> {
    return this.dao.then((dao) => dao.replacePartial(input));
  }

  /**
   * insert
   *
   * @param model - A entity class instance
   * @param mode - optional insert mode (default: BaseDAOInsertMode.ForceAutoGeneration)
   * @returns A promise of the inserted entity class instance
   */
  insert(model: T, mode = BaseDAOInsertMode.ForceAutoGeneration): Promise<T> {
    return this.dao.then((dao) => dao.insert(model, mode));
  }

  /**
   * insert partially - insert only columns mapped to the property keys from the partial input
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all columns mapped to excluded properties must be nullable or must have a database default value
   *
   * @param input - A partial instance of the entity class
   * @param mode - optional insert mode (default: BaseDAOInsertMode.ForceAutoGeneration)
   * @returns A promise of the partial instance of the entity class
   */
  insertPartial(input: Partial<T>, mode = BaseDAOInsertMode.ForceAutoGeneration): Promise<Partial<T>> {
    return this.dao.then((dao) => dao.insertPartial(input, mode));
  }

  /**
   * update
   *
   * @param model - A entity class instance
   * @returns A promise of the updated entity class instance
   */
  update(model: T): Promise<T> {
    return this.dao.then((dao) => dao.update(model));
  }

  /**
   * update partially - update only columns mapped to the property keys from the partial input
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all other columns are not affected by this update
   *
   * @param input - A partial instance of the entity class
   * @returns A promise of the partial instance of the entity class
   */
  updatePartial(input: Partial<T>): Promise<Partial<T>> {
    return this.dao.then((dao) => dao.updatePartial(input));
  }

  /**
   * update all - please provide a proper sql-condition otherwise all records will be updated!
   * this updates only columns mapped to the property keys from the partial input entity instance
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all other columns are not affected by this update
   *
   * @param input - A partial instance of the entity class
   * @param [where] - An optional Where-object or sql-text which will be added to the update-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the number of updated rows
   */
  updatePartialAll(input: Partial<T>, where?: Where<T>, params?: Object): Promise<number> {
    return this.dao.then((dao) => dao.updatePartialAll(input, where, params));
  }

  /**
   * deleteById
   *
   * @param input - A partial instance of the entity class
   * @returns A void promise
   */

  deleteById(input: Partial<T>): Promise<void> {
    return this.dao.then((dao) => dao.deleteById(input));
  }

  /**
   * delete all - please provide a proper sql-condition otherwise all records will be deleted!
   *
   * @param [where] - An optional Where-object or sql-text which will be added to the delete-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the number of deleted rows
   */
  deleteAll(where?: Where<T>, params?: Object): Promise<number> {
    return this.dao.then((dao) => dao.deleteAll(where, params));
  }
}
