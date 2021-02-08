import { Body, ConflictException, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'auth/guard/jwt-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { User } from 'database/user.model';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ParseObjectIdPipe } from '../shared/pipe/parse-object-id.pipe';
import { RegisterDto } from './register.dto';
import { UpdateUserDto } from './update-user.dto';
import { UserService } from './user.service';

@Controller({ path: "/users" })
export class UserController {

  constructor(private userService: UserService) { }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getUser(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('withSales', new DefaultValuePipe(false)) withSales?: boolean
  ): Observable<Partial<User>> {
    return this.userService.findById(id, withSales);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllUsers(
    @Query('withSales', new DefaultValuePipe(false)) withSales?: boolean
  ): Observable<Partial<User>[]> {
    return this.userService.findAll(withSales);
  }


  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  createUser(
    @Body() registerDto: RegisterDto): Observable<User> {
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
                return this.userService.createUser(registerDto);
              }
            })
          );
        }
      })
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateUser(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto): Observable<Partial<User>> {

    return this.userService.findById(id).pipe(
      mergeMap( found =>  {
        if (found){
          return this.userService.updateUser(id, updateUserDto);
        } else {
          throw new ConflictException(`User id:${id} does not exist`)
        }
      })
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteUser(
    @Param('id', ParseObjectIdPipe) id: string): Observable<User> {
      return this.userService.findById(id).pipe(
        mergeMap( found =>  {
          if (found){
            return this.userService.delete(id);
          } else {
            throw new ConflictException(`User id:${id} does not exist`)
          }
        })
      );
  }


}
