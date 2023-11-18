/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { EntityManager, InjectEntityManager } from '@homeofthings/nestjs-sqlite3';
import { Filter, Where } from 'sqlite3orm';
import { Contact } from '../entity/contact';
import { User } from '../entity/user';

export class UserEntityManagerService {
  constructor(@InjectEntityManager() public entityManager: EntityManager) {}

  userLoginNameExists(userLoginName: string): Promise<boolean> {
    return this.entityManager.exists(User, { userLoginName });
  }

  findUserByUserLoginName(userLoginName: string): Promise<User | undefined> {
    return this.entityManager.findAll(User, { userLoginName }).then((users) => {
      if (users.length > 1) {
        throw new Error(`found none`);
      }
      return users[0];
    });
  }

  findById(userId: number): Promise<User> {
    return this.entityManager.findById(User, { userId });
  }

  findOne(whereOrFilter?: Where<User> | Filter<User>, params?: Object): Promise<User> {
    return this.entityManager.findOne(User, whereOrFilter, params);
  }

  findByChild(contact: Contact): Promise<User> {
    return this.entityManager.findByChild(User, 'fk_user_contacts', Contact, contact);
  }

  findAllChildContactsOf(user: User): Promise<Contact[]> {
    // return this.entityManager.findAllChildsOf(User, 'fk_user_contacts', Contact, user);
    return this.entityManager.findAllByParent(Contact, 'fk_user_contacts', User, user);
  }

  insert(user: User): Promise<User> {
    return this.entityManager.insert(User, user);
  }

  insertPartial(user: Partial<User>): Promise<Partial<User>> {
    return this.entityManager.insertPartial(User, user);
  }

  save(user: User): Promise<User> {
    return this.entityManager.save(User, user);
  }

  savePartial(user: Partial<User>): Promise<Partial<User>> {
    return this.entityManager.savePartial(User, user);
  }

  update(user: User): Promise<User> {
    return this.entityManager.update(User, user);
  }

  updatePartial(user: Partial<User>): Promise<Partial<User>> {
    return this.entityManager.updatePartial(User, user);
  }

  updatePartialAll(input: Partial<User>, where?: Where<User>, params?: Object): Promise<number> {
    return this.entityManager.updatePartialAll(User, input, where, params);
  }

  deleteById(input: Partial<User>): Promise<void> {
    return this.entityManager.deleteById(User, input);
  }

  deleteAll(where?: Where<User>, params?: Object): Promise<number> {
    return this.entityManager.deleteAll(User, where, params);
  }
}
