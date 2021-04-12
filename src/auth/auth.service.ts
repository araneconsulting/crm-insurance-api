import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, map, throwIfEmpty } from 'rxjs/operators';
import { UserService } from '../user/user.service';
import { AccessToken } from './interface/access-token.interface';
import { JwtPayload } from './interface/jwt-payload.interface';
import { AuthenticatedUser } from './interface/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  validateUser(username: string, pass: string): Observable<AuthenticatedUser> {
    return this.userService.findByUsername(username).pipe(
      //if user is not found, convert it into an EMPTY.
      mergeMap((p) => (p ? of(p) : EMPTY)),

      // Using a general message in the authentication progress is more reasonable.
      // Concise info could be considered for security.
      // Detailed info will be helpful for crackers.
      // throwIfEmpty(() => new NotFoundException(`username:${username} was not found`)),
      throwIfEmpty(
        () => new UnauthorizedException(`username or password is not matched`),
      ),

      mergeMap((user) => {
        const {
          _id,
          password,
          username,
          email,
          roles,
          firstName,
          lastName,
          position,
          location,
          phone,
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
                position,
                location,
                phone,
              } as AuthenticatedUser;
            } else {
              // The same reason above.
              //throw new UnauthorizedException('password was not matched.')
              throw new UnauthorizedException(
                'username or password is not matched',
              );
            }
          }),
        );
      }),
    );
  }

  // If `LocalStrateg#validateUser` return a `Observable`, the `request.user` is
  // bound to a `Observable<AuthenticatedUser>`, not a `AuthenticatedUser`.
  //
  // I would like use the current `Promise` for this case, thus it will get
  // a `AuthenticatedUser` here directly.
  //
  login(user: AuthenticatedUser): Observable<AccessToken> {
    const payload: JwtPayload = {
      upn: user.username, //upn is defined in Microprofile JWT spec, a human readable principal name.
      sub: user.id,
      email: user.email,
      roles: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position,
      location: user.location,
      phone: user.phone,
    };
    return from(this.jwtService.signAsync(payload)).pipe(
      map((access_token) => {
        return { access_token };
      }),
    );
  }
}
