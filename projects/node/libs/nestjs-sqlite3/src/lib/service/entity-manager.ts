/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@homeofthings/nestjs-utils';
import { Logger } from '@nestjs/common';
import { BaseDAO, Filter, METADATA_MODEL_KEY, MetaModel, SqlDatabase, Where } from 'sqlite3orm';
import { ConnectionManager } from './connection-manager';
import { Repository } from './repository';

export class EntityManager {
  private readonly logger = new Logger('EntityManager');

  get connection(): Promise<SqlDatabase> {
    return this._connectionManager.getConnection(this._connectionName);
  }

  constructor(private _connectionManager: ConnectionManager, private _connectionName: string) {}

  /**
   * get a repository for the given entity class
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @returns A promise of the repository instance
   */
  getRepository<T>(entity: Type<T>): Promise<Repository<T>> {
    try {
      const repo = new Repository(entity, this._connectionManager, this._connectionName);
      return Promise.resolve(repo);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * get a custom repository for the given repository class value
   *
   * @template R - The custom repository class type
   * @param repository - The custom repository class value
   * @returns A promise of the custom repository instance
   */
  getCustomRepository<R>(repository: Type<R>): Promise<R> {
    const repo = new repository(this._connectionManager, this._connectionName);
    return Promise.resolve(repo);
  }

  /**
   * test if a model exists using an optional filter
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of true if a model exists or false otherwise
   */
  exists<T>(entity: Type<T>, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<boolean> {
    return this.getDao<T>(entity).then((dao) => dao.exists(whereOrFilter, params));
  }

  /**
   * count all models using an optional filter
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the count number
   */
  count<T>(entity: Type<T>, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<number> {
    return this.getDao<T>(entity).then((dao) => dao.countAll(whereOrFilter, params));
  }

  /**
   * find by primary key
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @returns A promise of the model instance
   */
  findById<T>(entity: Type<T>, input: Partial<T>): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.selectById(input));
  }

  /**
   * find all models using an optional filter
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  findAll<T>(entity: Type<T>, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T[]> {
    return this.getDao<T>(entity).then((dao) => dao.selectAll(whereOrFilter, params));
  }

  /**
   * find parent by using a foreign key constraint and a given child instance
   *
   * @template T - The entity class type
   * @template C - The entity class type mapped to the child table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param childEntity - The entity class value mapped to the childtable
   * @param childObj - An instance of the entity class mapped to the child table
   * @returns A promise of model instance
   */

  findByChild<T, C extends Object>(entity: Type<T>, constraintName: string, childEntity: Type<C>, childObj: C): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.selectByChild(constraintName, childEntity, childObj));
  }

  /**
   * find all childs using a foreign key constraint and a given parent instance
   *
   * @template T - The entity class type
   * @template P - The entity class type mapped to the parent table
   * @param constraintName - The foreign key constraint
   * @param parentEntity - The entity class value mapped to the parent table
   * @param parentObj - An instance of the entity class mapped to the parent table
   * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of model instances
   */
  findAllChildsOf<T, P extends Object>(
    entity: Type<T>,
    constraintName: string,
    parentEntity: Type<P>,
    parentObj: P,
    whereOrFilter?: Where<T> | Filter<T>,
    params?: Object,
  ): Promise<T[]> {
    return this.getDao<T>(entity).then((dao) => dao.selectAllOf(constraintName, parentEntity, parentObj, whereOrFilter, params));
  }

  /**
   * save - Saves a given entity.
   * If the given entity does not exist in the database, it will be inserted.
   * If the given entity does exist in he database, it will be updated.
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param model - An entity class instance
   * @returns A promise of the inserted or updated model class instance
   */
  save<T>(entity: Type<T>, model: T): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.replace(model));
  }

  /**
   * insert
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param model - An entity class instance
   * @returns A promise of the inserted model class instance
   */
  insert<T>(entity: Type<T>, model: T): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.insert(model));
  }

  /**
   * update
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param model - An entity class instance
   * @returns A promise of the updated model class instance
   */
  update<T>(entity: Type<T>, model: T): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.update(model));
  }

  /**
   * update all - please provide a proper sql-condition otherwise all records will be updated!
   * this updates only columns mapped to the property keys from the partial input model
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all other columns are not affected by this update
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @param [where] - An optional Where-object or sql-text which will be added to the update-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the updated model class instance
   */
  updatePartialAll<T>(entity: Type<T>, input: Partial<T>, where?: Where<T>, params?: Object): Promise<number> {
    return this.getDao<T>(entity).then((dao) => dao.updatePartialAll(input, where, params));
  }

  /**
   * deleteById
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @returns A promise
   */
  deleteById<T>(entity: Type<T>, input: Partial<T>): Promise<void> {
    return this.getDao<T>(entity).then((dao) => dao.deleteById(input));
  }

  /**
   * delete all - please provide a proper sql-condition otherwise all records will be deleted!
   *
   * @template T - The entity class type
   * @param entity - An entity class
   * @param [where] - An optional Where-object or sql-text which will be added to the delete-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise
   */
  deleteAll<T>(entity: Type<T>, where?: Where<T>, params?: Object): Promise<number> {
    return this.getDao<T>(entity).then((dao) => dao.deleteAll(where, params));
  }

  private getDao<T>(type: Type<T>): Promise<BaseDAO<T>> {
    return this.connection.then((sqlDb) => new BaseDAO<T>(type, sqlDb));
  }

  static getEntityTarget(entity: Type): string | undefined {
    const metaModel: MetaModel = Reflect.getMetadata(METADATA_MODEL_KEY, entity.prototype);
    return metaModel?.table.quotedName;
  }
}
