import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserLoginGuard extends AuthGuard('local') {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // check the email and the password
    await super.canActivate(context);

    // initialize the session
    await super.logIn(request);

    // if no exceptions were thrown, allow the access to the route
    return true;
  }
}
