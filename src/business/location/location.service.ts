import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Location } from 'database/location.model';
import { Model } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { LOCATION_MODEL } from '../../database/database.constants';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable({ scope: Scope.REQUEST })
export class LocationService {
  constructor(
    @Inject(LOCATION_MODEL) private locationModel: Model<Location>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  findAll(keyword?: string, skip = 0, limit = 0): Promise<Location[]> {
    if (keyword && keyword) {
      return this.locationModel
        .find({
          $or: [
            { name: { $regex: '.*' + keyword + '.*' } },
            { email: { $regex: '.*' + keyword + '.*' } },
          ],
        })
        .skip(skip)
        .limit(limit)
        .exec();
    } else {
      return this.locationModel.find({}).skip(skip).limit(limit).exec();
    }
  }

  findById(id: string): Promise<Location> {
    return from(this.locationModel.findOne({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`location:$id was not found`)),
      )
      .toPromise();
  }

  save(data: CreateLocationDto): Promise<Location> {
    return this.locationModel.create({
      ...data,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });
  }

  update(id: string, data: UpdateLocationDto): Promise<Location> {
    return from(
      this.locationModel
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
        throwIfEmpty(() => new NotFoundException(`location:$id was not found`)),
      )
      .toPromise();
  }

  deleteById(id: string): Promise<Location> {
    return from(this.locationModel.findOneAndRemove({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`location:$id was not found`)),
      )
      .toPromise();
  }

  deleteAll(): Promise<any> {
    return this.locationModel.deleteMany({}).exec();
  }

  async search(queryParams?: any): Promise<any> {
    const sortCriteria = {};
    sortCriteria[queryParams.sortField] =
      queryParams.sortOrder === 'desc' ? -1 : 1;
    const skipCriteria = (queryParams.pageNumber - 1) * queryParams.pageSize;
    const limitCriteria = queryParams.pageSize;

    let country = null;

    if (queryParams.filter.hasOwnProperty('country')) {
      country = queryParams.filter.country;
      delete queryParams.filter['country'];
    }

    let conditions = {};
    let fixedQueries = [];
    let filterQueries = [];

    conditions = {
      $and: [{ deleted: false }],
    };
    if (
      country ||
      (queryParams.filter && Object.keys(queryParams.filter).length > 0)
    ) {
      if (country) {
        conditions['$and'].push({ 'business.address.country': country });
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

    const query = this.locationModel.aggregate();

    if (conditions) {
      query.match(conditions);
    }

    query.append([
      {
        $project: {
          id: '$_id',
          name: '$business.name',
          code: '$code',
          alias: '$alias',
          email: '$business.email',
          city: '$business.address.city',
          country: '$business.address.country',
          phone: {
            $function: {
              body: function (business: any) {
                return `${business.primaryPhone} ${
                  business.primaryPhoneExtension
                    ? 'ext.' + business.primaryPhoneExtension
                    : ''
                }`;
              },
              args: ['$business'],
              lang: 'js',
            },
          },
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

  async getCatalog(filterCriteria: any): Promise<any> {
    return await this.locationModel
      .find(filterCriteria)
      .select('business.name _id')
      .sort({ name: 1 })
      .exec();
  }
}
