import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Customer } from 'database/customer.model';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../auth/interface/authenticated-request.interface';
import { CUSTOMER_MODEL } from '../database/database.constants';
import { CreateCustomerDto } from './create-customer.dto';
import { UpdateCustomerDto } from './update-customer.dto';

@Injectable({ scope: Scope.REQUEST })
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_MODEL) private customerModel: Model<Customer>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) { }

  findAll(keyword?: string, skip = 0, limit = 10): Observable<Customer[]> {
    if (keyword) {
      return from(
        this.customerModel
          .find({
            $or: [{ name: { $regex: '.*' + keyword + '.*' } },
            { email: { $regex: '.*' + keyword + '.*' } }, ]
          })
          .skip(skip)
          .limit(limit)
          .exec(),
      );
    } else {
      return from(this.customerModel.find({}).skip(skip).limit(limit).exec());
    }
  }

  findById(id: string): Observable<Customer> {
    return from(this.customerModel.findOne({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
    );
  }

  save(data: CreateCustomerDto): Observable<Customer> {
    //console.log('req.user:'+JSON.stringify(this.req.user));
    const createCustomer = this.customerModel.create({
      ...data,
      createdBy: { _id: this.req.user.id },
    });
    return from(createCustomer);
  }

  update(id: string, data: UpdateCustomerDto): Observable<Customer> {
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
    );
    // const filter = { _id: id };
    // const update = { ...data, updatedBy: { _id: this.req.user.id } };
    // return from(this.customerModel.findOne(filter).exec()).pipe(
    //   mergeMap((customer) => (customer ? of(customer) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.customerModel.updateOne(filter, update).exec());
    //   }),
    //   map((res) => res.nModified),
    // );
  }

  deleteById(id: string): Observable<Customer> {
    return from(this.customerModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
    );
    // const filter = { _id: id };
    // return from(this.customerModel.findOne(filter).exec()).pipe(
    //   mergeMap((customer) => (customer ? of(customer) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`customer:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.customerModel.deleteOne(filter).exec());
    //   }),
    //   map((res) => res.deletedCount),
    // );
  }

  deleteAll(): Observable<any> {
    return from(this.customerModel.deleteMany({}).exec());
  }
}
