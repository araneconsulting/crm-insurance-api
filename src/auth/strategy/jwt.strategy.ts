import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { User } from 'database/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: config.secretKey,
    });
  }

  //payload is the decoded jwt clmais.
  validate(payload: JwtPayload): Partial<User> {
    //console.log('jwt payload:' + JSON.stringify(payload));
    return {
      email: payload.upn,
      username: payload.username,
      id: payload.sub,
      roles: payload.roles,
      firstName: payload.firstName,
      lastName: payload.lastName,
      position: payload.position,
      //location: payload.location,
      phone: payload.phone,
    };
  }
}
