import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { AuthenticationModuleOptions, AUTHENTICATION_MODULE_OPTIONS_TOKEN, DEFAULT_BCRYPT_ROUNDS } from './model';

@Injectable()
export class AuthenticationService {
  constructor(@Inject(AUTHENTICATION_MODULE_OPTIONS_TOKEN) private options: AuthenticationModuleOptions, private readonly userService: UserService) {}

  public async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, this.options.bcryptRounds || DEFAULT_BCRYPT_ROUNDS);
    try {
      return this.userService.create({
        ...registrationData,
        password: hashedPassword,
      });
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.UNAUTHORIZED);
    }
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }
}
