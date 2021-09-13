/* eslint-disable @typescript-eslint/ban-types */
import { Type } from '@homeofthings/nestjs-utils';
import { Logger } from '@nestjs/common';
import { BaseDAO, BaseDAOInsertMode, Filter, METADATA_MODEL_KEY, MetaModel, SqlDatabase, Where } from 'sqlite3orm';
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
   * test if a row exists using an optional filter
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of true if at least one row exists or false otherwise
   */
  exists<T>(entity: Type<T>, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<boolean> {
    return this.getDao<T>(entity).then((dao) => dao.exists(whereOrFilter, params));
  }

  /**
   * count all rows using an optional filter
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of the count number of rows
   */
  count<T>(entity: Type<T>, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<number> {
    return this.getDao<T>(entity).then((dao) => dao.countAll(whereOrFilter, params));
  }

  /**
   * find entity by primary key
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @returns A promise of the entity class instance
   */
  findById<T>(entity: Type<T>, input: Partial<T>): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.selectById(input));
  }

  /**
   * find one entity
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @returns A promise of the entity instance
   */
  findOne<T>(entity: Type<T>, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.selectOne(whereOrFilter, params));
  }

  /**
   * find all entities using an optional filter
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param [whereOrFilter] - An optional Where/Filter-object or
   *                          sql-text which will be added to the select-statement
   *                             e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of entity class instances
   */
  findAll<T>(entity: Type<T>, whereOrFilter?: Where<T> | Filter<T>, params?: Object): Promise<T[]> {
    return this.getDao<T>(entity).then((dao) => dao.selectAll(whereOrFilter, params));
  }

  /**
   * find parent entity by using a foreign key constraint and a given child instance
   *
   * @template T - The entity class type of the parent
   * @template C - The entity class type mapped to the child table
   * @param constraintName - The foreign key constraint (defined in the child table)
   * @param childEntity - The entity class value mapped to the childtable
   * @param childObj - An instance of the entity class mapped to the child table
   * @returns A promise of the parent entity instance
   */

  findByChild<T, C extends Object>(entity: Type<T>, constraintName: string, childEntity: Type<C>, childObj: C): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.selectByChild(constraintName, childEntity, childObj));
  }

  /**
   * find all child entities using a foreign key constraint and a given parent instance
   *
   * @template T - The entity class type of the child
   * @template P - The entity class type mapped to the parent table
   * @param constraintName - The foreign key constraint
   * @param parentEntity - The entity class value mapped to the parent table
   * @param parentObj - An instance of the entity class mapped to the parent table
   * @param [whereOrFilter] - An optional Where/Filter-object or sql-text which will be added to the select-statement
   *                    e.g 'WHERE <your condition>'
   * @param [params] - An optional object with additional host parameter
   * @returns A promise of array of child entity instances
   */
  findAllByParent<T, P extends Object>(
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
   * @returns A promise of the inserted or updated entity class instance
   */
  save<T>(entity: Type<T>, model: T): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.replace(model));
  }

  /**
   * save partially - save (insert or update) only columns mapped to the property keys from the partial input
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * on insert: all columns mapped to excluded properties must be nullable or must have a database default value
   * on update: all columns mapped to excluded properties are not affected by this update
   *
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @returns A promise of the partial instance of the entity class
   */
  savePartial<T>(entity: Type<T>, input: Partial<T>): Promise<Partial<T>> {
    return this.getDao<T>(entity).then((dao) => dao.replacePartial(input));
  }

  /**
   * insert
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param model - An entity class instance
   * @param mode - optional insert mode (default: BaseDAOInsertMode.ForceAutoGeneration)
   * @returns A promise of the inserted entity class instance
   */
  insert<T>(entity: Type<T>, model: T, mode = BaseDAOInsertMode.ForceAutoGeneration): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.insert(model, mode));
  }

  /**
   * insert partially - insert only columns mapped to the property keys from the partial input
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all columns mapped to excluded properties must be nullable or must have a database default value
   *
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @param mode - optional insert mode (default: BaseDAOInsertMode.ForceAutoGeneration)
   * @returns A promise of the partial instance of the entity class
   */
  insertPartial<T>(entity: Type<T>, input: Partial<T>, mode = BaseDAOInsertMode.ForceAutoGeneration): Promise<Partial<T>> {
    return this.getDao<T>(entity).then((dao) => dao.insertPartial(input, mode));
  }

  /**
   * update
   *
   * @template T - The entity class type
   * @param entity - The entity class value
   * @param model - An entity class instance
   * @returns A promise of the updated entity class instance
   */
  update<T>(entity: Type<T>, model: T): Promise<T> {
    return this.getDao<T>(entity).then((dao) => dao.update(model));
  }

  /**
   * update partially - update only columns mapped to the property keys from the partial input
   *
   * for this to work:
   * all columns mapped to included properties must be nullable or their properties must provide a value
   * all other columns are not affected by this update
   *
   * @param entity - The entity class value
   * @param input - A partial instance of the entity class
   * @returns A promise of the partial instance of the entity class
   */
  updatePartial<T>(entity: Type<T>, input: Partial<T>): Promise<Partial<T>> {
    return this.getDao<T>(entity).then((dao) => dao.updatePartial(input));
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
   * @returns A promise of the number of updated rows
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
   * @returns A void promise
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
   * @returns A promise of the deleted number of rows
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
