import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import RegisterDto from './dto/register.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthenticationService {
  constructor(private readonly userService: UserService) {}

  public async register(registrationData: RegisterDto) {
    const hashedPassword = await argon2.hash(registrationData.password, { type: argon2.argon2id, memoryCost: 1024 * 16, timeCost: 6 }); // TODO: parameterize
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
    const isPasswordMatching = await argon2.verify(hashedPassword, plainTextPassword);
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }
}
