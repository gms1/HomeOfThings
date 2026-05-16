import { DbCatalogDAO, DbColumnTypeInfo } from '../dbcatalog';
import { backtickQuoteSimpleIdentifier } from '../utils';
import { FieldOpts } from './decorators';
import { PropertyType } from './PropertyType';
import { schema } from './Schema';

/**
 * Class holding a field definition
 *
 * @export
 * @class Field
 */
export class Field {
  /**
   * The name of the column
   */
  public name!: string;

  /**
   * The quoted field name
   */
  get quotedName(): string {
    return backtickQuoteSimpleIdentifier(this.name);
  }

  private _dbDefaultType!: string;
  get dbDefaultType(): string {
    return this._dbDefaultType;
  }
  set dbDefaultType(dbType: string) {
    this._dbDefaultType = dbType;
    if (!this._dbtype) {
      this._dbTypeInfo = Field.parseDbType(this._dbDefaultType);
    }
  }

  /**
   * The type of the table column
   */
  private _dbtype?: string;
  private _dbTypeInfo!: DbColumnTypeInfo;

  get dbtype(): string {
    return this._dbtype ? this._dbtype : this.dbDefaultType;
  }
  set dbtype(dbType: string) {
    this._dbtype = dbType;
    this._dbTypeInfo = Field.parseDbType(this._dbtype);
  }
  get isDbTypeDefined(): boolean {
    return this._dbtype ? true : false;
  }

  get dbTypeInfo(): DbColumnTypeInfo {
    return this._dbTypeInfo;
  }

  /**
   * If this property should be serialized/deserialized to the database as Json data
   */
  private _isJson?: boolean;

  get isJson(): boolean {
    return this._isJson == undefined ? false : this._isJson;
  }
  set isJson(isJson: boolean) {
    this._isJson = isJson;
  }
  get isIsJsonDefined(): boolean {
    return this._isJson == undefined ? false : true;
  }

  private _dateInMilliSeconds?: boolean;
  get dateInMilliSeconds(): boolean {
    return this._dateInMilliSeconds == undefined ? schema().dateInMilliSeconds : this._dateInMilliSeconds;
  }
  set dateInMilliSeconds(val: boolean) {
    this._dateInMilliSeconds = val;
  }
  get isDateInMilliSecondsDefined(): boolean {
    return this._dateInMilliSeconds == undefined ? false : true;
  }

  /**
   * Flag if this field is part of the primary key
   */
  isIdentity: boolean;

  /**
   * Creates an instance of Field.
   */
  public constructor(name: string, isIdentity?: boolean, opts?: FieldOpts, propertyType?: PropertyType) {
    this.name = name;
    this.isIdentity = !!isIdentity;

    this.setDbDefaultType(propertyType, opts);
    if (opts) {
      if (opts.dbtype) {
        this.dbtype = opts.dbtype;
      }
      if (opts.isJson != undefined) {
        this._isJson = opts.isJson;
      }
      if (opts.dateInMilliSeconds != undefined) {
        this._dateInMilliSeconds = opts.dateInMilliSeconds;
      }
    }
  }

  setDbDefaultType(propertyType?: PropertyType, opts?: FieldOpts): void {
    switch (propertyType) {
      case PropertyType.BOOLEAN:
      case PropertyType.DATE:
        if (opts && opts.notNull) {
          this.dbDefaultType = 'INTEGER NOT NULL';
        } else {
          this.dbDefaultType = 'INTEGER';
        }
        break;
      case PropertyType.NUMBER:
        if (this.isIdentity) {
          this.dbDefaultType = 'INTEGER NOT NULL';
        } else {
          if (opts && opts.notNull) {
            this.dbDefaultType = 'REAL NOT NULL';
          } else {
            this.dbDefaultType = 'REAL';
          }
        }
        break;
      default:
        // otherwise 'TEXT' will be used as default
        if (opts && opts.notNull) {
          this.dbDefaultType = 'TEXT NOT NULL';
        } else {
          this.dbDefaultType = 'TEXT';
        }
        break;
    }
  }

  static parseDbType(dbtype: string): DbColumnTypeInfo {
    const trimmed = dbtype.trimStart();

    const typeNameMatches = /^(\w+)/.exec(trimmed);
    if (!typeNameMatches) {
      throw new Error(`failed to parse '${dbtype}'`);
    }

    const CONSTRAINT_KEYWORDS = new Set([
      'CONSTRAINT',
      'PRIMARY',
      'NOT',
      'NULL',
      'UNIQUE',
      'CHECK',
      'DEFAULT',
      'COLLATE',
      'REFERENCES',
      'GENERATED',
    ]);

    let typeAffinity: string;
    let rest: string;
    const firstWord = typeNameMatches[1].toUpperCase();
    if (CONSTRAINT_KEYWORDS.has(firstWord)) {
      typeAffinity = 'NUMERIC';
      rest = trimmed;
    } else {
      typeAffinity = DbCatalogDAO.getTypeAffinity(typeNameMatches[1]);
      const afterType = trimmed.slice(typeNameMatches[0].length);
      const sizeMatches = /^\s*\(\s*\d+\s*(?:,\s*\d+\s*)?\)/.exec(afterType);
      rest = sizeMatches ? afterType.slice(sizeMatches[0].length) : afterType;
    }

    const notNull = /\bNOT\s+NULL\b/i.exec(rest) ? true : false;

    let defaultValue;
    const defaultNumberMatches = /\bDEFAULT\s+([+-]?\d+(\.\d*)?)/i.exec(rest);
    if (defaultNumberMatches) {
      defaultValue = defaultNumberMatches[1];
    }
    const defaultLiteralMatches = /\bDEFAULT\s+(('[^']*')+)/i.exec(rest);
    if (defaultLiteralMatches) {
      defaultValue = defaultLiteralMatches[1];
      defaultValue = defaultValue.replace(/''/g, "'");
    }
    const defaultExprIdx = /\bDEFAULT\s*\(/i.exec(rest);
    if (defaultExprIdx) {
      const start = defaultExprIdx.index + defaultExprIdx[0].length;
      let depth = 1;
      let end = start;
      while (end < rest.length && depth > 0) {
        if (rest[end] === '(') {
          depth++;
        } else if (rest[end] === ')') {
          depth--;
        }
        end++;
      }
      if (depth === 0) {
        defaultValue = rest.slice(start, end - 1);
      } else {
        throw new Error(`failed to parse '${dbtype}': unclosed parenthesis in DEFAULT expression`);
      }
    }

    // debug(`dbtype='${dbtype}'`);
    // debug(`type='${typeName}'`);
    // debug(`notNull='${notNull}'`);
    // debug(`default='${defaultValue}'`);
    return { typeAffinity, notNull, defaultValue };
  }
}
