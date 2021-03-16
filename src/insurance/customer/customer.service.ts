import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Customer } from 'database/customer.model';
import { Model } from 'mongoose';
import { EMPTY, from, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { CUSTOMER_MODEL } from '../../database/database.constants';
import { CreateCustomerDto } from './create-customer.dto';
import { UpdateCustomerDto } from './update-customer.dto';

@Injectable({ scope: Scope.REQUEST })
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) { }

  findAll(keyword?: string, skip = 0, limit = 0): Promise<Customer[]> {
    if (keyword && keyword) {
      return 
        this.customerModel
          .find({
            $or: [{ name: { $regex: '.*' + keyword + '.*' } },
            { email: { $regex: '.*' + keyword + '.*' } }, ]
          })
          .skip(skip)
          .limit(limit)
          .exec();
    } else {
      return this.customerModel.find({}).skip(skip).limit(limit).exec();
    }
  }

  findById(id: string): Promise<Customer> {
    return from(this.customerModel.findOne({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
    ).toPromise();
  }

  save(data: CreateCustomerDto): Promise<Customer> {
    return this.customerModel.create({
      ...data,
      createdBy: { _id: this.req.user.id },
    });
  }

  update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    return from(
      this.customerModel
        .findOneAndUpdate(
          { _id: id },
          { ...data, updatedBy: { _id: this.req.user.id } },
          { new: true },
        )
        .exec(),
    ).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
    ).toPromise();
  }

  deleteById(id: string): Promise<Customer> {
    return from(this.customerModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
    ).toPromise();
  }

  deleteAll(): Promise<any> {
    return this.customerModel.deleteMany({}).exec();
  }
}
