import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreatePayrollDto } from 'business/payroll/dto/create-payroll.dto';
import { UpdatePayrollDto } from 'business/payroll/dto/update-payroll.dto';
import { Payroll } from 'database/payroll.model';
import { Model } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { PAYROLL_MODEL } from '../../database/database.constants';

@Injectable({ scope: Scope.REQUEST })
export class PayrollService {
  constructor(
    @Inject(PAYROLL_MODEL) private payrollModel: Model<Payroll>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) {}

  findAll(keyword?: string, skip = 0, limit = 0): Promise<Payroll[]> {
    if (keyword && keyword) {
      return this.payrollModel
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
      return this.payrollModel.find({}).skip(skip).limit(limit).exec();
    }
  }

  findById(id: string): Promise<Payroll> {
    return from(this.payrollModel.findOne({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`payroll:$id was not found`)),
      )
      .toPromise();
  }

  save(data: CreatePayrollDto): Promise<Payroll> {
    return this.payrollModel.create({
      ...data,
      createdBy: { _id: this.req.user.id },
    });
  }

  update(id: string, data: UpdatePayrollDto): Promise<Payroll> {
    return from(
      this.payrollModel
        .findOneAndUpdate(
          { _id: id },
          { ...data, updatedBy: { _id: this.req.user.id } },
          { new: true },
        )
        .exec(),
    )
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`payroll:$id was not found`)),
      )
      .toPromise();
  }

  deleteById(id: string): Promise<Payroll> {
    return from(this.payrollModel.findOneAndRemove({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`payroll:$id was not found`)),
      )
      .toPromise();
  }

  deleteAll(): Promise<any> {
    return this.payrollModel.deleteMany({}).exec();
  }
}
