import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Sale } from 'database/sale.model';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { SALE_MODEL } from '../../database/database.constants';
import { CreateSaleDto } from './create-sale.dto';
import { UpdateSaleDto } from './update-sale.dto';

@Injectable({ scope: Scope.REQUEST })
export class SaleService {
  constructor(
    @Inject(SALE_MODEL) private saleModel: Model<Sale>,
    @Inject(REQUEST) private req: AuthenticatedRequest,
  ) { }

  findAll(keyword?: string, skip = 0, limit = 0, withSeller = false, withCustomer = false, withInsurers = false): Observable<Sale[]> {

    let saleQuery = (keyword) 
    ? this.saleModel
    .find({
      $or: [{ name: { $regex: '.*' + keyword + '.*' } },
      { email: { $regex: '.*' + keyword + '.*' } }, ]
    })
    .skip(skip)
    .limit(limit)
    : this.saleModel.find({}).skip(skip).limit(limit);

    


    if (withSeller) {
      saleQuery.populate("seller");
    }

    if (withCustomer) {
      saleQuery.populate("customer");
    }

    if (withInsurers) {
      saleQuery.populate("liabilityInsurer");
      saleQuery.populate("cargoInsurer");
      saleQuery.populate("physicalDamageInsurer");
      saleQuery.populate("wcGlUmbInsurer");
    }

    
      return from(saleQuery.exec());
    
  }

  findById(id: string, withSeller = false, withCustomer = false, withInsurers = false): Observable<Sale> {

    const saleQuery = this.saleModel.findOne({ _id: id });

    if (withSeller) {
      saleQuery.populate("seller");
    }

    if (withCustomer) {
      saleQuery.populate("customer");
    }

    if (withInsurers) {
      saleQuery.populate("liabilityInsurer");
      saleQuery.populate("cargoInsurer");
      saleQuery.populate("physicalDamageInsurer");
      saleQuery.populate("wcGlUmbInsurer");
    }

    return from(saleQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );
  }

  save(data: CreateSaleDto): Observable<Sale> {
    //console.log('req.user:'+JSON.stringify(this.req.user));
    const createSale = this.saleModel.create({
      ...data
    });
    return from(createSale);
  }

  update(id: string, data: UpdateSaleDto): Observable<Sale> {
    return from(
      this.saleModel
        .findOneAndUpdate(
          { _id: id },
          { ...data },
          { new: true },
        )
        .exec(),
    ).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );

    
    // const filter = { _id: id };
    // const update = { ...data, updatedBy: { _id: this.req.user.id } };
    // return from(this.saleModel.findOne(filter).exec()).pipe(
    //   mergeMap((sale) => (sale ? of(sale) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.saleModel.updateOne(filter, update).exec());
    //   }),
    //   map((res) => res.nModified),
    // );
  }

  deleteById(id: string): Observable<Sale> {
    return from(this.saleModel.findOneAndDelete({ _id: id }).exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    );
    // const filter = { _id: id };
    // return from(this.saleModel.findOne(filter).exec()).pipe(
    //   mergeMap((sale) => (sale ? of(sale) : EMPTY)),
    //   throwIfEmpty(() => new NotFoundException(`sale:$id was not found`)),
    //   switchMap((p, i) => {
    //     return from(this.saleModel.deleteOne(filter).exec());
    //   }),
    //   map((res) => res.deletedCount),
    // );
  }

  deleteAll(): Observable<any> {
    return from(this.saleModel.deleteMany({}).exec());
  }
}
