/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectRepository, Repository } from '@homeofthings/nestjs-sqlite3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { HOT_MAIN_DB } from '../model';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, HOT_MAIN_DB)
    private usersRepository: Repository<User>,
  ) {}

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ id });
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.insert(userData as User);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async setFailedLoginAttempt(_user: User, _request: Request): Promise<void> {
    // TODO:
  }
}
