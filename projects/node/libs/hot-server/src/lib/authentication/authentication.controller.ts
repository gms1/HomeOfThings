/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { User } from '../user/entity/user.entity';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserIsAuthenticatedGuard } from './user-is-authenticated.guard';
import { UserLoginGuard } from './user-login.guard';

interface RequestWithUser extends Express.Request {
  user: User;
}

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  @UseGuards(UserIsAuthenticatedGuard) // TODO: check admin role
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(UserLoginGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Req() request: RequestWithUser) {
    return request.user;
  }

  @HttpCode(200)
  @UseGuards(UserIsAuthenticatedGuard)
  @Get()
  async authenticate(@Req() request: RequestWithUser): Promise<User> {
    return request.user;
  }

  @HttpCode(200)
  @UseGuards(UserIsAuthenticatedGuard)
  @Post('logout')
  async logout(@Req() request: Express.Request): Promise<void> {
    request.logOut();
    request.session.cookie.maxAge = 0;
  }
}
