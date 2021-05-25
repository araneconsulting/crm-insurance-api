import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Customer } from 'database/customer.model';
import { query } from 'express';
import { Model } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { CUSTOMER_MODEL } from '../../database/database.constants';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/customer.dto';

@Injectable({ scope: Scope.REQUEST })
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  findAll(skip = 0, limit = 0): Promise<Customer[]> {
    return this.customerModel.find({}).skip(skip).limit(limit).exec();
  }

  findById(id: string): Promise<Customer> {
    return from(this.customerModel.findOne({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
      )
      .toPromise();
  }

  save(data: CreateCustomerDto): Promise<Customer> {
    return this.customerModel.create({
      ...data,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });
  }

  update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    return from(
      this.customerModel
        .findOneAndUpdate(
          { _id: id },
          {
            ...data,
            updatedBy: { _id: this.req.user.id },
            company: { _id: this.req.user.company },
          },
          { new: true },
        )
        .exec(),
    )
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
      )
      .toPromise();
  }

  deleteById(id: string): Promise<Customer> {
    return from(this.customerModel.findOneAndDelete({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
      )
      .toPromise();
  }

  deleteAll(): Promise<any> {
    return this.customerModel.deleteMany({}).exec();
  }

  async searchOld(queryParams?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let type = null;
    if (queryParams.filter.hasOwnProperty('type')) {
      type = queryParams.filter.type;
      delete queryParams.filter['type'];
    }

    if (
      type ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      let conditions = type
        ? {
            $and: [{ type: type }],
          }
        : {};

      if (queryParams.filter && Object.keys(queryParams.filter).length > 0) {
        const filterQueries = Object.keys(queryParams.filter).map((key) => {
          return {
            [key]: {
              $regex: new RegExp('.*' + queryParams.filter[key] + '.*', 'i'),
            },
          };
        });

        conditions['$or'] = filterQueries;
      }

      return {
        totalCount: await this.customerModel
          .find(conditions)
          .countDocuments()
          .exec(),
        entities: await this.customerModel
          .find(conditions)
          .skip(skipCriteria)
          .limit(limitCriteria)
          .sort(sortCriteria)
          .exec(),
      };
    } else {
      return {
        totalCount: await this.customerModel.find().countDocuments().exec(),
        entities: await this.customerModel
          .find()
          .skip(skipCriteria)
          .limit(limitCriteria)
          .sort(sortCriteria)
          .exec(),
      };
    }
  }

  async getCatalog(filterCriteria: any): Promise<any> {
    return await this.customerModel
      .find(filterCriteria)
      .select('name business.name contact.firstName contact.lastName type _id')
      .sort({ name: 1 })
      .exec();
  }

  async search(queryParams?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let type = null;
    if (queryParams.filter.hasOwnProperty('type')) {
      type = queryParams.filter.type;
      delete queryParams.filter['type'];
    }

    let conditions = null;
    if (
      type ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      conditions = type
        ? {
            $and: [{ type: type }],
          }
        : {};

      if (queryParams.filter && Object.keys(queryParams.filter).length > 0) {
        const filterQueries = Object.keys(queryParams.filter).map((key) => {
          return {
            [key]: {
              $regex: new RegExp('.*' + queryParams.filter[key] + '.*', 'i'),
            },
          };
        });

        conditions['$or'] = filterQueries;
      }
    }

    const query = this.customerModel.aggregate();

    if (conditions) {
      query.match(conditions);
    }

    query.append([
      {
        $project: {
          type: '$type',
          fax: '$business.fax',
          name: {
            $function: {
              body: function (business: any, contact: any, type: any) {
                return type === 'BUSINESS'
                  ? business.name
                  : `${contact.firstName}  ${contact.lastName}`;
              },
              args: ['$business', '$contact', '$type'],
              lang: 'js',
            },
          },
          email: {
            $function: {
              body: function (business: any, contact: any, type: any) {
                return type === 'BUSINESS' ? business.email : contact.email;
              },
              args: ['$business', '$contact', '$type'],
              lang: 'js',
            },
          },
          phone: {
            $function: {
              body: function (business: any, contact: any, type: any) {
                return type === 'BUSINESS'
                  ? `${business.primaryPhone} ext.${business.primaryPhoneExtension}`
                  : contact.phone || contact.mobilePhone;
              },
              args: ['$business', '$contact', '$type'],
              lang: 'js',
            },
          },
          state: {
            $function: {
              body: function (business: any, contact: any, type: any) {
                return type === 'BUSINESS'
                  ? business.address.state
                  : contact.address.state;
              },
              args: ['$business', '$contact', '$type'],
              lang: 'js',
            },
          },
          code: '$code',
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
}
