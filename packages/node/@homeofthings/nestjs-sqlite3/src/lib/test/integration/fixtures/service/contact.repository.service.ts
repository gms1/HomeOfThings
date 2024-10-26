/* eslint-disable @typescript-eslint/ban-types */

import { Filter, Where } from 'sqlite3orm';

import { InjectRepository } from '../../../../common/sqlite3.decorators';
import { Repository } from '../../../../service/repository';
import { Contact } from '../entity/contact';
import { User } from '../entity/user';

export class ContactRepositoryService {
  constructor(@InjectRepository(Contact) public repository: Repository<Contact>) {}

  contactEmailAddressExists(emailAddress: string): Promise<boolean> {
    return this.repository.exists({ emailAddress });
  }

  countContacts(userId: number): Promise<number> {
    return this.repository.count({ userId });
  }

  findAllContacts(whereOrFilter?: Where<Contact> | Filter<Contact>, params?: object): Promise<Contact[]> {
    return this.repository.findAll(whereOrFilter, params);
  }

  findAllByParent(user: User, whereOrFilter?: Where<Contact> | Filter<Contact>, params?: object): Promise<Contact[]> {
    return this.repository.findAllByParent('fk_user_contacts', User, user, whereOrFilter, params);
  }

  findParentOf(contact: Contact): Promise<User> {
    return this.repository.findParentOf('fk_user_contacts', User, contact);
  }
}
