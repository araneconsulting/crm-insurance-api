import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Location } from 'database/location.model';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { USER_MODEL } from '../database/database.constants';
import { User, UserModel } from '../database/user.model';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODEL) private userModel: UserModel,
    private sendgridService: SendgridService,
  ) {}

  findByUsername(username: string): Observable<User> {
    return from(this.userModel.findOne({ username }).exec());
  }

  findByEmail(email: string): Observable<User> {
    return from(this.userModel.findOne({ email }).exec());
  }

  async findByLocation(location:Partial<Location>): Promise<User[]> {
    return this.userModel.find({location:location}).exec();
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

  async createUser(data: CreateUserDto, user: Partial<User>): Promise<User> {
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

    const authUser = await this.userModel.findOne({ _id: user.id });

    const created = this.userModel.create({
      ...data,
      createdBy: authUser.id,
      company: authUser.company,
    });

    return from(created).toPromise();

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

  updateUser(
    id: string,
    data: UpdateUserDto,
    user: Partial<User>,
  ): Observable<User> {
    const updateQuery = this.userModel.findOneAndUpdate(
      { _id: id },
      { ...data, updatedBy: user.id },
      {
        new: true,
      },
    );
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

    if (!withPassword) {
      userQuery.select('-password');
    }

    return from(userQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`user:${id} was not found`)),
    );
  }

  async findAll(skip = 0, limit = 0): Promise<User[]> {
    return this.userModel.find().skip(skip).limit(limit).exec();
  }

  async search(queryParams?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let roles = null;

    if (queryParams.filter.hasOwnProperty('roles')) {
      roles = queryParams.filter.roles;
      delete queryParams.filter['roles'];
    }

    let conditions = {};
    let fixedQueries = [];
    let filterQueries = [];

    conditions = {
      $and: [{ deleted: false }, { roles: { $nin: ['SUPER'] } }],
    };
    if (
      roles ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      if (roles) {
        conditions['$and'].push({ roles: roles });
      }

      if (queryParams.filter && Object.keys(queryParams.filter).length > 0) {
        filterQueries = Object.keys(queryParams.filter).map((key) => {
          return {
            [key]: {
              $regex: new RegExp('.*' + queryParams.filter[key] + '.*', 'i'),
            },
          };
        });
      }
    }

    if (filterQueries.length || fixedQueries.length) {
      conditions['$or'] = [...filterQueries, ...fixedQueries];
    }

    const query = this.userModel.aggregate();

    query
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: 'location',
      })
      .unwind({ path: '$location', preserveNullAndEmptyArrays: true });

    if (conditions) {
      query.match(conditions);
    }

    query.append([
      {
        $project: {
          id: '$_id',
          roles: '$roles',
          firstName: '$firstName',
          lastName: '$lastName',
          email: '$email',
          phone: '$phone',
          deleted: '$deleted',
          locationName: {
            $function: {
              body: function (location: any) {
                return location ? location.business.name : 'N/A';
              },
              args: ['$location'],
              lang: 'js',
            },
          },
          code: '$code',
          createdAt: '$createdAt',
        },
      },
    ]);

    query.skip(skipCriteria).limit(limitCriteria).sort(sortCriteria);

    const entities = await query.exec();

    return {
      entities: entities,
      totalCount: entities.length,
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
