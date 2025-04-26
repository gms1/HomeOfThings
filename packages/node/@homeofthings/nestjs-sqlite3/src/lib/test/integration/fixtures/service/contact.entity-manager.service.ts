import { Filter, Where } from 'sqlite3orm';

import { InjectEntityManager } from '../../../../common/sqlite3.decorators';
import { EntityManager } from '../../../../service/entity-manager';
import { Contact } from '../entity/contact';
import { User } from '../entity/user';

export class ContactEntityManagerService {
  constructor(@InjectEntityManager() public entityManager: EntityManager) {}

  contactEmailAddressExists(emailAddress: string): Promise<boolean> {
    return this.entityManager.exists(Contact, { emailAddress });
  }

  countContacts(userId: number): Promise<number> {
    return this.entityManager.count(Contact, { userId });
  }

  findAllContacts(whereOrFilter?: Where<Contact> | Filter<Contact>, params?: object): Promise<Contact[]> {
    return this.entityManager.findAll(Contact, whereOrFilter, params);
  }

  findAllByParent(user: User, whereOrFilter?: Where<Contact> | Filter<Contact>, params?: object): Promise<Contact[]> {
    return this.entityManager.findAllByParent(Contact, 'fk_user_contacts', User, user, whereOrFilter, params);
  }

  findParentOf(contact: Contact): Promise<User> {
    // return this.entityManager.findParentOf(Contact, 'fk_user_contacts', User, contact);
    return this.entityManager.findByChild(User, 'fk_user_contacts', Contact, contact);
  }
}
