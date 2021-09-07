/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@homeofthings/nestjs-utils';
import { BaseDAO, Filter, METADATA_MODEL_KEY, MetaModel, SqlDatabase, Table, Where } from 'sqlite3orm';
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
   * test if a model exists using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of true if a model exists or false otherwise
   */
  exists(whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<boolean> {
    return this.dao.then((dao) => dao.exists(whereOrFilter, params));
  }

  /**
   * count all models using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the count number
   */
  count(whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<number> {
    return this.dao.then((dao) => dao.countAll(whereOrFilter, params));
  }

  /**
   * find by primary key
   *
   * @param input - A partial instance of the entity class
   * @returns A promise of the model instance
   */
  findById(input: Partial<T>): Promise<T> {
    return this.dao.then((dao) => dao.selectById(input));
  }

  /**
   * find all models using an optional filter
   *
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  findAll(whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T[]> {
    return this.dao.then((dao) => dao.selectAll(whereOrFilter, params));
  }

  /**
   * find parent by using a foreign key constraint and a given child instance
   *
   * @template C - The entity class type mapped to the child table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param childEntity - The entity class value mapped to the childtable
   * @param childObj - An instance of the entity class mapped to the child table
   * @returns A promise of model instance
   */

  findByChild<C extends Object>(constraintName: string, childEntity: Type<C>, childObj: C): Promise<T> {
    return this.dao.then((dao) => dao.selectByChild(constraintName, childEntity, childObj));
  }

  /**
   * find all childs using a foreign key constraint and a given parent instance
   *
   * @template P - The entity class type mapped to the parent table
   * @param constraintName - The foreign key constraint
   * @param parentEntity - The entity class value mapped to the parent table
   * @param parentObj - An instance of the entity class mapped to the parent table
   * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  findAllChildsOf<P extends Object>(constraintName: string, parentEntity: Type<P>, parentObj: P, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T[]> {
    return this.dao.then((dao) => dao.selectAllOf(constraintName, parentEntity, parentObj, whereOrFilter, params));
  }

  /**
   * save - Saves a given entity.
   * If the given entity does not exist in the database, it will be inserted.
   * If the given entity does exist in he database, it will be updated.
   *
   * @param model - A model class instance
   * @returns A promise of the inserted or updated model class instance
   */
  save(model: T): Promise<T> {
    return this.dao.then((dao) => dao.replace(model));
  }

  /**
   * insert
   *
   * @param model - A model class instance
   * @returns A promise of the inserted model class instance
   */
  insert(model: T): Promise<T> {
    return this.dao.then((dao) => dao.insert(model));
  }

  /**
   * update
   *
   * @param model - A model class instance
   * @returns A promise of the updated model class instance
   */
  update(model: T): Promise<T> {
    return this.dao.then((dao) => dao.update(model));
  }

  /**
   * update all - please provide a proper sql-condition otherwise all records will be updated!
   * this updates only columns mapped to the property keys from the partial input model
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all other columns are not affected by this update
   *
   * @param input - A partial instance of the entity class
   * @param [where] - An optional Where-object or sql-text which will be added to the update-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the updated model class instance
   */
  updatePartialAll(input: Partial<T>, where?: Where<T>, params?: Object): Promise<number> {
    return this.dao.then((dao) => dao.updatePartialAll(input, where, params));
  }

  /**
   * deleteById
   *
   * @param input - A partial instance of the entity class
   * @returns A promise
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
   * @returns A promise
   */
  deleteAll(where?: Where<T>, params?: Object): Promise<number> {
    return this.dao.then((dao) => dao.deleteAll(where, params));
  }
}
