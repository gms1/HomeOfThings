/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column, Entity, PrimaryKeyColumn } from '../../../../common/sqlite3.decorators';

@Entity({ name: 'USERS', autoIncrement: true })
export class User {
  @PrimaryKeyColumn({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
  userId!: number;

  @Column({ name: 'user_loginname', dbtype: 'TEXT NOT NULL' })
  userLoginName!: string;

  @Column({ name: 'user_firstname', dbtype: 'TEXT NOT NULL' })
  userFirstName!: string;

  @Column({ name: 'user_lastname', dbtype: 'TEXT NOT NULL' })
  userLastName!: string;

  @Column({ name: 'user_json', dbtype: 'TEXT', isJson: true })
  userJsonData: any;

  @Column({ name: 'user_deleted' })
  deleted?: boolean;
}
