import { UserService } from '../user/user.service';
import { User } from '../user/entity/user.entity';
import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: CallableFunction) {
    done(null, user.id);
  }

  async deserializeUser(userId: string, done: CallableFunction) {
    const user = await this.userService.getById(Number(userId));
    done(null, user);
  }
}
