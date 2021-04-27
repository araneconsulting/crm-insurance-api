import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EMPTY, from, Observable, of, throwError } from 'rxjs';
import { mergeMap, tap, throwIfEmpty, catchError } from 'rxjs/operators';
import { USER_MODEL } from '../database/database.constants';
import { User, UserModel } from '../database/user.model';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODEL) 
    private userModel: UserModel,
    private sendgridService: SendgridService,
  ) {}

  findByUsername(username: string): Observable<User> {
    return from(this.userModel.findOne({ username }).exec());
  }

  findByEmail(email: string): Observable<User> {
    return from(this.userModel.findOne({ email }).exec());
  }

  existsByUsername(username: string): Observable<boolean> {
    return from(this.userModel.exists({ username }));
  }

  existsByEmail(email: string): Observable<boolean> {
    return from(this.userModel.exists({ email }));
  }

  existsById(id: string): Observable<boolean> {
    return from(this.userModel.exists({ id }));
  }

  createUser(data: CreateUserDto): Observable<User> {
    // Simply here we can send a verification email to the new registered user
    // by calling SendGrid directly.
    //
    // In a microservice application, you can send this msg to a message broker
    // then subsribe it in antoher (micro)service and send the emails.

    // Use base64 to genrate a random string
    // const randomCode = btoa(Math.random().toString()).slice(0, 4);
    // console.log(`random alias:${randomCode}`);

    // const created = this.userModel.create({
    //   ...data,
    //   verified: false,
    //   verifyCode: randomCode,
    //   roles: [RoleType.SELLER]
    // });

    //  Sendgrid can manage email templates, use an existing template is more reasonable.
    //
    // const msg = {
    //   to: data.email,
    //   from: 'no-reply@example.com', // Use the email address or domain you verified above
    //   subject: 'Welcome to Nestjs Sample',
    //   text: `verification alias:${randomCode}`,
    //   html: `<strong>verification alias:${randomCode}</strong>`,
    // };
    // this.sendgridService.send(msg)
    //   .subscribe({
    //     next: data => console.log(`${data}`),
    //     error: error => console.log(`${error}`)
    //   });

    const created = this.userModel.create({
      ...data,
      //roles: [RoleType.SELLER]
    });

    return from(created);

    // const msg = {
    //   from: 'liuver@gmail.com', // Use the email address or domain you verified above
    //   subject: 'Welcome to Nestjs Sample',
    //   templateId: "d-cc6080999ac04a558d632acf2d5d0b7a",
    //   personalizations: [
    //     {
    //       to: data.email,
    //       dynamicTemplateData: { name: data.firstName + ' ' + data.lastName },
    //     }
    //   ]

    // };
    // return this.sendgridService.send(msg).pipe(
    //   catchError(err=>of(`sending email failed:${err}`)),
    //   tap(data => console.log(data)),
    //   mergeMap(data => from(created)),
    // );
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    const updateQuery = this.userModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    return from(updateQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`user:${id} was not found`)),
    );
  }

  delete(id: string): Observable<User> {
    const deleteQuery = this.userModel.findByIdAndDelete({ _id: id });
    return from(deleteQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`user:${id} was not found`)),
    );
  }

  findById(
    id: string,
    withPassword = false,
    withSales = false,
    withCompany = false,
    withLocation = false,
    withSupervisor = false,
  ): Observable<User> {
    const userQuery = this.userModel.findOne({ _id: id });
    if (withSales) {
      userQuery.populate('sales');
    }
    if (withCompany) {
      userQuery.populate('company');
    }

    if (withLocation) {
      userQuery.populate('location');
    }

    if (withSupervisor) {
      userQuery.populate('supervisor');
    }

    if (!withPassword){
      userQuery.select('-password');
    }

    return from(userQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`user:${id} was not found`)),
    );
  }

  /* findAll(withSales = false): Observable<User[]> {
    const userQuery = this.userModel.find();
    if (withSales) {
      userQuery.populate('sales');
    }
    return from(userQuery.exec());
  } */

  async findAll(skip = 0, limit = 0): Promise<User[]> {
    return this.userModel.find({}).skip(skip).limit(limit).exec();
  }

  async search(queryParams?: any, projection?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let filterCriteria = {};

    if (
      queryParams.filter &&
      Object.keys(queryParams.filter).length > 0 &&
      queryParams.filter.constructor === Object
    ) {
      filterCriteria = {
        $or: Object.keys(queryParams.filter).map((key) => {
          return {
            [key]: {
              $regex: new RegExp('.*' + queryParams.filter[key] + '.*', 'i'),
            },
          };
        }),
      };
    }

    return {
      totalCount: await this.userModel
        .find(filterCriteria)
        .countDocuments()
        .exec(),
      entities: await this.userModel
        .find(filterCriteria)
        .skip(skipCriteria)
        .limit(limitCriteria)
        .sort(sortCriteria)
        .exec(),
    };
  }

  async getCatalog(filterCriteria?: any): Promise<any> {
    return await this.userModel
      .find(filterCriteria || {})
      .select('firstName lastName roles _id')
      .sort({ name: 1 })
      .exec();
  }

}
