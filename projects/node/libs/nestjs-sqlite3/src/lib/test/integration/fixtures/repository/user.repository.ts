/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { ConnectionManager, Repository } from '@homeofthings/nestjs-sqlite3';
import { Contact } from '../entity/contact';
import { User } from '../entity/user';

export class UserRepository extends Repository<User> {
  constructor(connectionManager: ConnectionManager, private connectionName: string) {
    super(User, connectionManager, connectionName);
  }

  findByLoginName(userLoginName: string): Promise<User | undefined> {
    return this.findAll({ userLoginName }).then((users) => {
      if (users.length > 1) {
        throw new Error(`found none`);
      }
      return users[0];
    });
  }

  findByChildContact(contact: Contact): Promise<User> {
    return this.findByChild('fk_user_contacts', Contact, contact);
  }

  findAllChildContactsOf(user: User): Promise<Contact[]> {
    return this.findAllChildsOf('fk_user_contacts', Contact, user);
  }
}
