import { Injectable } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';

import { UserSession } from '../user/entity/user-session';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private moduleRef: ModuleRef) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }
  async validate(request: Request, email: string, password: string): Promise<UserSession> {
    const contextId = ContextIdFactory.getByRequest(request);
    const authenticationService = await this.moduleRef.resolve(AuthenticationService, contextId);
    return authenticationService.getAuthenticatedUser(request, email, password);
  }
}
