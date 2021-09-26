/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Body, Req, Controller, HttpCode, Post, UseGuards, UseInterceptors, ClassSerializerInterceptor, Get } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { UserIsAuthenticatedGuard } from './user-is-authenticated.guard';
import { UserLoginGuard } from './user-login.guard';
import { User } from '../user/entity/user.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import passport from 'passport';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import session from 'express-session';
interface RequestWithUser extends Express.Request {
  user: User;
}

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(UserLoginGuard)
  @Post('login')
  async login(@Req() request: RequestWithUser) {
    return request.user;
  }

  @HttpCode(200)
  @UseGuards(UserIsAuthenticatedGuard)
  @Get()
  async authenticate(@Req() request: RequestWithUser) {
    return request.user;
  }

  @HttpCode(200)
  @UseGuards(UserIsAuthenticatedGuard)
  @Post('logout')
  async logout(@Req() request: Express.Request) {
    request.logOut();
    request.session.cookie.maxAge = 0;
  }
}
