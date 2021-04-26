import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'database/user.model';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, map, throwIfEmpty } from 'rxjs/operators';
import { UserService } from '../user/user.service';
import { AccessToken } from './interface/access-token.interface';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  validateUser(email: string, pass: string): Observable<User> {
    console.log(email);

    return this.userService.findByEmail(email).pipe(
      //if user is not found, convert it into an EMPTY.
      mergeMap((p) => (p ? of(p) : EMPTY)),

      // Using a general message in the authentication progress is more reasonable.
      // Concise info could be considered for security.
      // Detailed info will be helpful for crackers.
      // throwIfEmpty(() => new NotFoundException(`email:${email} was not found`)),
      throwIfEmpty(
        () => new UnauthorizedException(`email or password is not matched`),
      ),

      mergeMap((user) => {
        const {
          _id,
          username,
          email,
          roles,
          firstName,
          lastName,
          phone,
          company,
        } = user;
        return user.comparePassword(pass).pipe(
          map((m) => {
            if (m) {
              return {
                id: _id,
                username,
                email,
                roles,
                firstName,
                lastName,
                phone,
                company,
              } as User;
            } else {
              // The same reason above.
              //throw new UnauthorizedException('password was not matched.')
              throw new UnauthorizedException(
                'email or password is not matched',
              );
            }
          }),
        );
      }),
    );
  }

  // If `LocalStrateg#validateUser` return a `Observable`, the `request.user` is
  // bound to a `Observable<Partial<User>>`, not a `Partial<User>`.
  //
  // I would like use the current `Promise` for this case, thus it will get
  // a `Partial<User>` here directly.
  //
  login(user: Partial<User>): Observable<AccessToken> {
    const payload: JwtPayload = {
      upn: user.email, //upn is defined in Microprofile JWT spec, a human readable principal name.
      sub: user.id,
      username: user.username,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      company: user.company,
    };
    console.log('after login', user);
    return from(this.jwtService.signAsync(payload)).pipe(
      map((accessToken) => {
        return { accessToken };
      }),
    );
  }
}
