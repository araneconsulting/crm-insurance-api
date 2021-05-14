import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreatePayrollDto } from 'business/payroll/dto/create-payroll.dto';
import { UpdatePayrollDto } from 'business/payroll/dto/update-payroll.dto';
import { Payroll } from 'database/payroll.model';
import { User } from 'database/user.model';
import { Model } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { PAYROLL_MODEL, USER_MODEL } from '../../database/database.constants';

const ADDON_TYPE_DISCOUNT = 'DISCOUNT';
const ADDON_TYPE_BONUS = 'BONUS';
const ADDON_TYPE_REIMBURSEMENT = 'REIMBURSEMENT';
const ADDON_SCOPE_LOCATION = 'LOCATION';

@Injectable({ scope: Scope.REQUEST })
export class PayrollService {
  constructor(
    @Inject(PAYROLL_MODEL) private payrollModel: Model<Payroll>,
    @Inject(USER_MODEL) private userModel: Model<User>,
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

  async save(data: CreatePayrollDto): Promise<Payroll> {
    console.log(this.req.user);

    const authUser = await this.userModel.findOne({ _id: this.req.user.id });

    const payrollDto = {
      ...data,
      company: authUser.company,
      createdBy: { _id: authUser.id },
    };

    payrollDto.payStubs.map((payStub) => {
      payStub['totalSalary'] =
        payStub.payRate * payStub.normalHoursWorked +
        payStub.overtimeHoursWorked * payStub.payRate * 1.5;

      payStub['totalBonus'] = payStub.addons.reduce(function (prev, cur) {
        return prev + (cur.type === ADDON_TYPE_BONUS ? cur.amount : 0);
      }, 0);

      payStub['totalDiscount'] = payStub.addons.reduce(function (prev, cur) {
        return prev + (cur.type === ADDON_TYPE_DISCOUNT ? cur.amount : 0);
      }, 0);

      payStub['totalReimbursement'] = payStub.addons.reduce(function (
        prev,
        cur,
      ) {
        return prev + (cur.type === ADDON_TYPE_REIMBURSEMENT ? cur.amount : 0);
      },
      0);

      return payStub;
    });

    if (payrollDto.scope === ADDON_SCOPE_LOCATION && !payrollDto.location) {
      payrollDto.location = authUser.location;
    }

    return this.payrollModel.create(payrollDto);
  }

  async update(id: string, data: UpdatePayrollDto): Promise<Payroll> {
    const authUser = await this.userModel.findOne({ _id: this.req.user.id });

    const payrollDto = {
      ...data,
      updatedBy: { _id: authUser.id },
    };

    payrollDto.payStubs.map((payStub) => {
      payStub['totalSalary'] =
        payStub.payRate * payStub.normalHoursWorked +
        payStub.overtimeHoursWorked * payStub.payRate * 1.5;

      payStub['totalBonus'] = payStub.addons.reduce(function (prev, cur) {
        return prev + (cur.type === ADDON_TYPE_BONUS ? cur.amount : 0);
      }, 0);

      payStub['totalDiscount'] = payStub.addons.reduce(function (prev, cur) {
        return prev + (cur.type === ADDON_TYPE_DISCOUNT ? cur.amount : 0);
      }, 0);

      payStub['totalReimbursement'] = payStub.addons.reduce(function (
        prev,
        cur,
      ) {
        return prev + (cur.type === ADDON_TYPE_REIMBURSEMENT ? cur.amount : 0);
      },
      0);

      return payStub;
    });

    return from(
      this.payrollModel
        .findOneAndUpdate({ _id: id }, payrollDto, { new: true })
        .exec(),
    )
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`Payroll:$id was not found`)),
      )
      .toPromise();
  }

  deleteById(id: string): Promise<Payroll> {
    return from(this.payrollModel.findOneAndRemove({ _id: id }).exec())
      .pipe(
        mergeMap((p) => (p ? of(p) : EMPTY)),
        throwIfEmpty(() => new NotFoundException(`Payroll:$id was not found`)),
      )
      .toPromise();
  }

  deleteAll(): Promise<any> {
    return this.payrollModel.deleteMany({}).exec();
  }
}
