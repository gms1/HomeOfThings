import { Column, Entity, ForeignKey, Index, PrimaryKeyColumn } from '../../../../common/sqlite3.decorators';

@Entity({ name: 'CONTACTS', autoIncrement: true })
export class Contact {
  @PrimaryKeyColumn({ name: 'contact_id', dbtype: 'INTEGER NOT NULL' })
  contactId!: number;

  @Column({ name: 'contact_email', dbtype: 'TEXT' })
  emailAddress?: string;

  @Column({ name: 'contact_mobile', dbtype: 'TEXT' })
  mobile?: string;

  @Column({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
  @ForeignKey('fk_user_contacts', 'USERS', 'user_id')
  @Index('idx_contacts_user')
  userId!: number;
}
