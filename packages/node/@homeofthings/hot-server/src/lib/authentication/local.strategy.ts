import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { UserSession } from '../user/entity/user-session';
import { Request } from 'express';

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
