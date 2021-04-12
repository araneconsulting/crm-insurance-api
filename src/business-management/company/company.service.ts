import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Company } from 'database/company.model';
import { Model } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { COMPANY_MODEL } from '../../database/database.constants';
import { CreateCompanyDto } from './create-company.dto';
import { UpdateCompanyDto } from './update-company.dto';

@Injectable({ scope: Scope.REQUEST })
export class CompanyService {
  constructor(
    @Inject(COMPANY_MODEL) private companyModel: Model<Company>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  findAll(keyword?: string, skip = 0, limit = 0): Promise<Company[]> {
    if (keyword && keyword) {
      return this.companyModel
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
      return this.companyModel.find({}).skip(skip).limit(limit).exec();
    }
  }

  findById(id: string): Promise<Company> {
    return from(this.companyModel.findOne({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`company:$id was not found`)),
      )
      .toPromise();
  }

  save(data: CreateCompanyDto): Promise<Company> {
    return this.companyModel.create({
      ...data,
      createdBy: { _id: this.req.user.id },
    });
  }

  update(id: string, data: UpdateCompanyDto): Promise<Company> {
    return from(
      this.companyModel
        .findOneAndUpdate(
          { _id: id },
          { ...data, updatedBy: { _id: this.req.user.id } },
          { new: true },
        )
        .exec(),
    )
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`company:$id was not found`)),
      )
      .toPromise();
  }

  deleteById(id: string): Promise<Company> {
    return from(this.companyModel.findOneAndRemove({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`company:$id was not found`)),
      )
      .toPromise();
  }

  deleteAll(): Promise<any> {
    return this.companyModel.deleteMany({}).exec();
  }
}
