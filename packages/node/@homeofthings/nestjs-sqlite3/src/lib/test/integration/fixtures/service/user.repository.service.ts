/* eslint-disable @typescript-eslint/ban-types */

import { Filter, Where } from 'sqlite3orm';

import { InjectCustomRepository } from '../../../../common/sqlite3.decorators';
import { Contact } from '../entity/contact';
import { User } from '../entity/user';
import { UserRepository } from '../repository/user.repository';

export class UserRepositoryService {
  constructor(@InjectCustomRepository(UserRepository) public repository: UserRepository) {}

  userLoginNameExists(userLoginName: string): Promise<boolean> {
    return this.repository.exists({ userLoginName });
  }

  findUserByUserLoginName(userLoginName: string): Promise<User | undefined> {
    return this.repository.findByLoginName(userLoginName);
  }

  findById(userId: number): Promise<User> {
    return this.repository.findById({ userId });
  }

  findOne(whereOrFilter?: Where<User> | Filter<User>, params?: Object): Promise<User> {
    return this.repository.findOne(whereOrFilter, params);
  }

  findByChild(contact: Contact): Promise<User> {
    return this.repository.findByChildContact(contact);
  }

  findAllChildContactsOf(user: User): Promise<Contact[]> {
    return this.repository.findAllChildContactsOf(user);
  }

  insert(user: User): Promise<User> {
    return this.repository.insert(user);
  }

  insertPartial(user: Partial<User>): Promise<Partial<User>> {
    return this.repository.insertPartial(user);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  savePartial(user: Partial<User>): Promise<Partial<User>> {
    return this.repository.savePartial(user);
  }

  update(user: User): Promise<User> {
    return this.repository.update(user);
  }

  updatePartial(user: Partial<User>): Promise<Partial<User>> {
    return this.repository.updatePartial(user);
  }

  updatePartialAll(input: Partial<User>, where?: Where<User>, params?: Object): Promise<number> {
    return this.repository.updatePartialAll(input, where, params);
  }

  deleteById(input: Partial<User>): Promise<void> {
    return this.repository.deleteById(input);
  }

  deleteAll(where?: Where<User>, params?: Object): Promise<number> {
    return this.repository.deleteAll(where, params);
  }
}
