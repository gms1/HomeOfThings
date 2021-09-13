import { Column, Entity, Index, PrimaryKeyColumn } from '@homeofthings/nestjs-sqlite3';
import { Exclude } from 'class-transformer';

@Entity({ name: 'USERS', autoIncrement: true })
class User {
  @PrimaryKeyColumn({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
  public id?: number;

  @Column({ name: 'user_email', dbtype: 'TEXT NOT NULL' })
  @Index('idx_users_email', true)
  public email: string;

  @Column({ name: 'user_firstname', dbtype: 'TEXT NOT NULL' })
  public firstName: string;

  @Column({ name: 'user_lastname', dbtype: 'TEXT NOT NULL' })
  public lastName: string;

  @Column()
  @Exclude()
  public password: string;
}

export default User;
