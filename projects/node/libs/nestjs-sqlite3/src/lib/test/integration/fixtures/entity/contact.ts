import { field, fk, id, index, table } from 'sqlite3orm';

@table({ name: 'CONTACTS', autoIncrement: true })
export class Contact {
  @id({ name: 'contact_id', dbtype: 'INTEGER NOT NULL' })
  contactId!: number;

  @field({ name: 'contact_email', dbtype: 'TEXT' })
  emailAddress?: string;

  @field({ name: 'contact_mobile', dbtype: 'TEXT' })
  mobile?: string;

  @field({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
  @fk('fk_user_contacts', 'USERS', 'user_id')
  @index('idx_contacts_user')
  userId!: number;
}
