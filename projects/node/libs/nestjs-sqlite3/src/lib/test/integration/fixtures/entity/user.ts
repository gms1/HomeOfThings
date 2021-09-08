/* eslint-disable @typescript-eslint/no-explicit-any */
import { field, id, table } from 'sqlite3orm';

@table({ name: 'USERS', autoIncrement: true })
export class User {
  @id({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
  userId!: number;

  @field({ name: 'user_loginname', dbtype: 'TEXT NOT NULL' })
  userLoginName!: string;

  @field({ name: 'user_firstname', dbtype: 'TEXT NOT NULL' })
  userFirstName!: string;

  @field({ name: 'user_lastname', dbtype: 'TEXT NOT NULL' })
  userLastName!: string;

  @field({ name: 'user_json', dbtype: 'TEXT', isJson: true })
  userJsonData: any;

  @field({ name: 'user_deleted' })
  deleted?: boolean;
}
