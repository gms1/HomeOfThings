/* eslint-disable no-empty */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class UserIsAuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      if (request.isAuthenticated && request.isAuthenticated()) {
        // TODO: validate if user session IP is request.ip ?
        return true;
      }
    } catch (_err) {}
    return Promise.reject(new UnauthorizedException());
  }
}
