import { MetaModel } from '../metadata';

export interface QueryOperation {
  toSql(metaModel: MetaModel, params: object, tablePrefix: string): Promise<string>;
}
