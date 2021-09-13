import { Sqlite3Module } from '@homeofthings/nestjs-sqlite3';
import { Module } from '@nestjs/common';
import User from './entity/user.entity';
import { UserService } from './user.service';

@Module({
  imports: [Sqlite3Module.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
