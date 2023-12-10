import { Sqlite3Module } from '@homeofthings/nestjs-sqlite3';
import { Module } from '@nestjs/common';

import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { HOT_MAIN_DB } from '../model';

@Module({
  imports: [Sqlite3Module.forFeature([User], HOT_MAIN_DB)],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
