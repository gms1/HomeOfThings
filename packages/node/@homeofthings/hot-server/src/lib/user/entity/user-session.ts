import { Column, Entity, Index, PrimaryKeyColumn } from '@homeofthings/nestjs-sqlite3';

@Entity({ name: 'USER_SESSIONS', autoIncrement: true })
export class UserSession {
  @PrimaryKeyColumn({ name: 'session_id', dbtype: 'INTEGER NOT NULL' })
  id: number;

  @Column({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
  @Index('idx_sessions_userid', true)
  userId: number;

  @Column({ name: 'user_email', dbtype: 'TEXT NOT NULL' })
  userEmail: string;

  @Column({ name: 'user_shortname', dbtype: 'TEXT NOT NULL' })
  userShortName: string;

  @Column({ name: 'client_ip', dbtype: 'TEXT NOT NULL' })
  clientIp: string;
}
