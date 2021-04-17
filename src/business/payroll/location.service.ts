import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreateLocationDto } from 'business/location/dto/create-location.dto';
import { UpdateLocationDto } from 'business/location/dto/update-location.dto';
import { Location } from 'database/location.model';
import { Model } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { LOCATION_MODEL } from '../../database/database.constants';

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
    });
  }

  update(id: string, data: UpdateLocationDto): Promise<Location> {
    return from(
      this.locationModel
        .findOneAndUpdate(
          { _id: id },
          { ...data, updatedBy: { _id: this.req.user.id } },
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
}
