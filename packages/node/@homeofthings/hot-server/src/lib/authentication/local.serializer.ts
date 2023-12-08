import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { UserSession } from '../user/entity/user-session';
import { UserSessionService } from '../user/user-ssession.service';

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(private readonly userSessionService: UserSessionService) {
    super();
  }

  serializeUser(session: UserSession, done: CallableFunction) {
    done(null, session.id);
  }

  async deserializeUser(sessionId: string, done: CallableFunction) {
    try {
      const session = await this.userSessionService.getSessionById(Number(sessionId));
      done(null, session);
    } catch (err) {
      done(err);
    }
  }
}
