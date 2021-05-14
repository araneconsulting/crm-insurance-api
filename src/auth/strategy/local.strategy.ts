import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'database/user.model';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  // When using Observable as return type, the exeption in the pipeline is ignored.
  // In our case, the `UnauthorizedException` is **NOT** caught and handled as expected.
  // The flow is NOT prevented by the exception and continue to send a `Observable` to
  // the next step aka calling `this.authService.login` in `AppController#login` method.
  // Then the jwt token is generated in any case(eg. wrong email or wrong password),
  // the authenticatoin worflow does not work as expected.
  //
  // The solution is customizing `PassportSerializer`.
  // Example: https://github.com/jmcdo29/zeldaPlay/blob/master/apps/api/src/app/auth/session.serializer.ts
  //
  // validate(email: string, password: string): Observable<any> {
  //   return this.authService
  //     .validateUser(email, password)
  //     .pipe(throwIfEmpty(() => new UnauthorizedException()));
  // }

  async validate(email: string, password: string): Promise<User> {
    const user: User = await this.authService
      .validateUser(email, password)
      .toPromise();

      console.log(user)

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
