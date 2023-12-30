import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

import { User } from '../user/entity/user.entity';
import { UserSession } from '../user/entity/user-session';
import { UserService } from '../user/user.service';
import { UserSessionService } from '../user/user-ssession.service';
import { RegisterDto } from './dto/register.dto';
import { AUTHENTICATION_MODULE_OPTIONS_TOKEN, AuthenticationModuleOptions, DEFAULT_BCRYPT_ROUNDS } from './model';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(AUTHENTICATION_MODULE_OPTIONS_TOKEN) private options: AuthenticationModuleOptions,
    private readonly userService: UserService,
    private readonly userSessionService: UserSessionService,
  ) {}

  async register(registrationData: RegisterDto): Promise<User> {
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

  async getAuthenticatedUser(request: Request, email: string, plainTextPassword: string): Promise<UserSession> {
    try {
      const user = await this.userService.getByEmail(email);
      const authenticated = await bcrypt.compare(plainTextPassword, user.passwordHash as string);
      if (!authenticated) {
        await this.userService.setFailedLoginAttempt(user, request);
        throw new Error(`not authenticated`);
      }
      return this.userSessionService.createSession(user, request);
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.UNAUTHORIZED);
    }
  }
}
