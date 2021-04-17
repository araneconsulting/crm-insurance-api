import { Body, ConflictException, Controller, DefaultValuePipe, Delete, Get, HttpCode, Param, Post, Put, Query, Res, UseFilters, UseGuards } from '@nestjs/common';
import { HasRoles } from 'auth/guard/has-roles.decorator';
import { JwtAuthGuard } from 'auth/guard/jwt-auth.guard';
import { RolesGuard } from 'auth/guard/roles.guard';
import { User } from 'database/user.model';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { RoleType } from 'shared/enum/role-type.enum';
import { BadRequestFilter } from 'shared/filter/bad-request.filter';
import { MongoFilter } from 'shared/filter/mongo.filter';
import { ParseObjectIdPipe } from '../shared/pipe/parse-object-id.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
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
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.LEGAL)
  @UseFilters( MongoFilter)
  createUser(
    @Body() createUserDto: CreateUserDto): Observable<User> {
    const email = createUserDto.email;

    return this.userService.existsByEmail(email).pipe(
      mergeMap(exists => {
        if (exists) {
          throw new ConflictException(`email:${email} exists already`)
        }
        else {
          const email = createUserDto.email;
          return this.userService.existsByEmail(email).pipe(
            mergeMap(exists => {
              if (exists) {
                throw new ConflictException(`email:${email} exists already`)
              }
              else {
                return this.userService.createUser(createUserDto);
              }
            })
          );
        }
      })
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.LEGAL)
  @UseFilters( MongoFilter)
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
  @HasRoles(RoleType.OWNER, RoleType.ADMIN, RoleType.LEGAL)
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
