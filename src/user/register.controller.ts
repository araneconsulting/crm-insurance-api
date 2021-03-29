import { Body, ConflictException, Controller, HttpCode, Post, Res, UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'auth/guard/jwt-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { BadRequestFilter } from 'shared/filter/bad-request.filter';
import { MongoFilter } from 'shared/filter/mongo.filter';
import { RegisterDto } from './register.dto';
import { UserService } from './user.service';

@Controller('register')
export class RegisterController {
    constructor(private userService: UserService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(201)
    @UseFilters(BadRequestFilter, MongoFilter)
    register(
        @Body() registerDto: RegisterDto,
        @Res() res: Response): Observable<Response> {
        const username = registerDto.username;

        return this.userService.existsByUsername(username).pipe(
            mergeMap(exists => {
                if (exists) {
                    throw new ConflictException(`username:${username} exists already`)
                }
                else {
                    const email = registerDto.email;
                    return this.userService.existsByEmail(email).pipe(
                        mergeMap(exists => {
                            if (exists) {
                                throw new ConflictException(`email:${email} exists already`)
                            }
                            else {
                                return this.userService.createUser(registerDto).pipe(
                                    map(user =>
                                        res.location('/users/' + user.id)
                                            .status(201)
                                            .send()
                                    )
                                );
                            }
                        })
                    );
                }
            })
        );
    }
}
