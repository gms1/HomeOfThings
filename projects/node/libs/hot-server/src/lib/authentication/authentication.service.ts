import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { AuthenticationModuleOptions, AUTHENTICATION_MODULE_OPTIONS_TOKEN, DEFAULT_BCRYPT_ROUNDS } from './model';
import { UserSession } from '../user/entity/user-session';
import { SessionService } from '../user/user-ssession.service';
import { Request } from 'express';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(AUTHENTICATION_MODULE_OPTIONS_TOKEN) private options: AuthenticationModuleOptions,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  public async register(registrationData: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registrationData.password, this.options.bcryptRounds || DEFAULT_BCRYPT_ROUNDS);
    try {
      return this.userService.create({
        ...registrationData,
        passwordHash: hashedPassword,
      });
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  public async getAuthenticatedUser(request: Request, email: string, plainTextPassword: string): Promise<UserSession> {
    try {
      // NOTE: using UserSessionService instead of UserService;
      // because `getAuthenticatedUser` is called by `LocalStrategy.validate` and a connection context is not yet available (not yet intercepted by Sqlite3Interceptor)
      const user = await this.sessionService.getUserByEmail(email);
      const authenticated = await bcrypt.compare(plainTextPassword, user.passwordHash);
      if (!authenticated) {
        await this.sessionService.setFailedLoginAttempt(user, request);
        throw new Error(`not authenticated`);
      }
      return this.sessionService.createSession(user, request);
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.UNAUTHORIZED);
    }
  }
}
