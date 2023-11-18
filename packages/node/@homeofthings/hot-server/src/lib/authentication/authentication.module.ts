import { createDynamicRootModule } from '@homeofthings/nestjs-utils';
import { Inject, Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import session from 'express-session';
import passport from 'passport';
import { UsersModule } from '../user/user.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { LocalSerializer } from './local.serializer';
import { LocalStrategy } from './local.strategy';
import { AUTHENTICATION_MODULE_OPTIONS_TOKEN, DEFAULT_SESSION_NAME, DEFAULT_SESSION_MAX_AGE, DEFAULT_SESSION_SECRET } from './model/authentication.constants';
import { AuthenticationModuleOptions } from './model/authentication.options';
import { UserSessionService } from '../user/user-ssession.service';
@Module({
  imports: [UsersModule, PassportModule],
  providers: [LocalStrategy, LocalSerializer],
})
export class AuthenticationModule
  extends createDynamicRootModule<AuthenticationModule, AuthenticationModuleOptions>(AUTHENTICATION_MODULE_OPTIONS_TOKEN, {
    providers: [AuthenticationService, UserSessionService],
    exports: [AuthenticationService, UserSessionService],
    controllers: [AuthenticationController],
  })
  implements NestModule
{
  private readonly logger = new Logger(AuthenticationModule.name);

  constructor(@Inject(AUTHENTICATION_MODULE_OPTIONS_TOKEN) private readonly options: AuthenticationModuleOptions) {
    super();
  }

  configure(consumer: MiddlewareConsumer) {
    const maxAgeOption = this.options.session?.maxAge;
    let secretOption = this.options.session?.secret;
    if (!secretOption) {
      this.logger.warn('Please configure session secret');
      secretOption = DEFAULT_SESSION_SECRET;
    }
    consumer.apply(
      session({
        // TODO: set store if we do not want to use the MemoryStore
        secret: secretOption,
        name: this.options.session?.name || DEFAULT_SESSION_NAME,
        rolling: true,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: 'auto',
          maxAge: maxAgeOption == undefined ? DEFAULT_SESSION_MAX_AGE : maxAgeOption,
          sameSite: 'strict',
          domain: this.options.session?.domain,
          path: this.options.session?.path,
        },
      }),
    );

    consumer.apply(passport.initialize());
    consumer.apply(passport.session());
  }
}
