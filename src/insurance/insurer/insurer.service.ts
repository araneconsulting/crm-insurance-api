import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Insurer } from 'database/insurer.model';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { INSURER_MODEL } from '../../database/database.constants';
import { CreateInsurerDto } from './create-insurer.dto';
import { UpdateInsurerDto } from './update-insurer.dto';

@Injectable({ scope: Scope.REQUEST })
export class InsurerService {
  constructor(
    @Inject(INSURER_MODEL) private insurerModel: Model<Insurer>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  findAll(keyword?: string, skip = 0, limit = 0): Observable<Insurer[]> {
    if (keyword) {
      return from(
        this.insurerModel
          .find({
            $or: [
              { name: { $regex: '.*' + keyword + '.*' } },
              { email: { $regex: '.*' + keyword + '.*' } },
            ],
          })
          .skip(skip)
          .limit(limit)
          .exec(),
      );
    } else {
      return from(this.insurerModel.find({}).skip(skip).limit(limit).exec());
    }
  }

  findById(id: string): Observable<Insurer> {
    return from(this.insurerModel.findOne({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`insurer:$id was not found`)),
    );
  }

  save(data: CreateInsurerDto): Observable<Insurer> {
    console.log(this.req.user);
    const createInsurer = this.insurerModel.create({
      ...data,
      createdBy: { _id: this.req.user.id },
      company: { _id: this.req.user.company },
    });
    return from(createInsurer);
  }

  update(id: string, data: UpdateInsurerDto): Observable<Insurer> {
    return from(
      this.insurerModel
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
    ).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`insurer:$id was not found`)),
    );
    // const filter = { _id: id };
    // const update = { ...data, updatedBy: { _id: this.req.user.id } };
    // return from(this.insurerModel.findOne(filter).exec()).pipe(
    //   mergeMap((insurer) => (insurer ? of(insurer) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`insurer:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.insurerModel.updateOne(filter, update).exec());
    //   }),
    //   map((res) => res.nModified),
    // );
  }

  deleteById(id: string): Observable<Insurer> {
    return from(this.insurerModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`insurer:$id was not found`)),
    );
    // const filter = { _id: id };
    // return from(this.insurerModel.findOne(filter).exec()).pipe(
    //   mergeMap((insurer) => (insurer ? of(insurer) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`insurer:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.insurerModel.deleteOne(filter).exec());
    //   }),
    //   map((res) => res.deletedCount),
    // );
  }

  deleteAll(): Observable<any> {
    return from(this.insurerModel.deleteMany({}).exec());
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
        totalCount: await this.insurerModel
          .find(conditions)
          .countDocuments()
          .exec(),
        entities: await this.insurerModel
          .find(conditions)
          .skip(skipCriteria)
          .limit(limitCriteria)
          .sort(sortCriteria)
          .exec(),
      };
    } else {
      return {
        totalCount: await this.insurerModel.find().countDocuments().exec(),
        entities: await this.insurerModel
          .find()
          .skip(skipCriteria)
          .limit(limitCriteria)
          .sort(sortCriteria)
          .exec(),
      };
    }
  }

  async getCatalog(filterCriteria: any): Promise<any> {
    return await this.insurerModel
      .find(filterCriteria)
      .select('business.name type _id subproviders')
      .sort({ "business.name": 1 })
      .exec();
  }
}
