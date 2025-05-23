/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as core from './core';

import { Statement } from 'sqlite3';

export interface SqlRunResult {
  lastID: number;
  changes: number;
}

/**
 * A thin wrapper for the 'Statement' class from 'node-sqlite3' using Promises instead of callbacks
 * see
 * https://github.com/mapbox/node-sqlite3/wiki/API
 *
 * @export
 * @class SqlStatement
 */
export class SqlStatement {
  private readonly stmt: Statement;

  /**
   * Creates an instance of SqlStatement.
   *
   * @param stmt
   */
  public constructor(stmt: Statement) {
    this.stmt = stmt;
  }

  /**
   * Bind the given parameters to the prepared statement
   *
   * @param params
   */
  /* istanbul ignore next */
  // see https://github.com/mapbox/node-sqlite3/issues/841
  public bind(...params: any[]): this {
    this.stmt.bind(params);
    return this;
  }

  /**
   * Reset a open cursor of the prepared statement preserving the parameter binding
   * Allows re-execute of the same query
   *
   * @returns {Promise<void>}
   */
  public reset(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.stmt.reset(() => {
        resolve();
      });
    });
  }

  /**
   * Finalizes a prepared statement ( freeing any resource used by this statement )
   *
   * @returns {Promise<void>}
   */
  public finalize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.stmt.finalize((err) => {
        if (err) {
          /* istanbul ignore next */
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Runs a prepared statement with the specified parameters
   *
   * @param [params] - The parameters referenced in the statement; you can provide multiple parameters as array
   * @returns A promise
   */
  public run(params?: any): Promise<SqlRunResult> {
    return new Promise<SqlRunResult>((resolve, reject) => {
      this.stmt.run(params, function(err: Error): void {
        if (err) {
          reject(err);
        } else {
          const res: SqlRunResult = {
            lastID: this.lastID,
            changes: this.changes,
          };
          resolve(res);
        }
      });
    });
  }

  /**
   * Runs a prepared statement with the specified parameters, fetching only the first row
   *
   * @param [params] - The parameters referenced in the statement; you can provide multiple parameters as array
   * @returns A promise
   */
  public get(params?: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.stmt.get(params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Runs a prepared statement with the specified parameters, fetching all rows
   *
   * @param [params] - The parameters referenced in the statement; you can provide multiple parameters as array
   * @returns A promise
   */
  public all(params?: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.stmt.all(params, (err, rows) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Runs a prepared statement with the specified parameters, fetching all rows
   * using a callback for each row
   *
   * @param [params]
   * @param [callback]
   * @returns A promise
   */
  public each(params?: any, callback?: (err: Error, row: any) => void): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.stmt.each(params, callback, (err: Error, count: number) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
  }
}
