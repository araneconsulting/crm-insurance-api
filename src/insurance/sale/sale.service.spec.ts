import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { FilterQuery, Model } from 'mongoose';
import { SALE_MODEL } from '../../database/database.constants';
import { Sale } from '../../database/sale.model';
import { SaleService} from './sale.service';


describe('SaleService', () => {
  let service: SaleService;
  let model: Model<Sale>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService,
        {
          provide: SALE_MODEL,
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
            deleteMany: jest.fn(),
            deleteOne: jest.fn(),
            updateOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findOneAndDelete: jest.fn(),
          },
        },
        {
          provide: REQUEST,
          useValue: {
            user: {
              id: 'dummyId',
            },
          },
        },
      ],
    }).compile();

    service = await module.resolve<SaleService>(SaleService);
    model = module.get<Model<Sale>>(SALE_MODEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all sales', async () => {
    const sales = [
      {
        _id: '5ee49c3115a4e75254bb732e',
        soldAt: "02-20-2020",
        customer: {_id: 'dummyId',},
        seller: {_id: 'dummyId',},
        liabilityInsurer: {_id: 'dummyId',},
        liabilityCharge: 1000.50,
        cargoInsurer: {_id: 'dummyId',},
        cargoCharge: 200.50,
        physicalDamageInsurer: {_id: 'dummyId',},
        physicalDamageCharge: 300.00,
        wcGlUmbInsurer: {_id: 'dummyId',},
        wcGlUmbCharge: 500.00,
        fees: 200,
        permits: 100,
        tips: 50,
        chargesPaid: 1200.00
      },
      {
        _id: '5ee49c3115a4e75254bb732f',
        soldAt: "02-20-2020",
        customer: {_id: 'dummyId',},
        seller: {_id: 'dummyId',},
        liabilityInsurer: {_id: 'dummyId',},
        liabilityCharge: 1000.50,
        cargoInsurer: {_id: 'dummyId',},
        cargoCharge: 200.50,
        physicalDamageInsurer: {_id: 'dummyId',},
        physicalDamageCharge: 300.00,
        wcGlUmbInsurer: {_id: 'dummyId',},
        wcGlUmbCharge: 500.00,
        fees: 200,
        permits: 100,
        tips: 50,
        chargesPaid: 1200.00
      },
      {
        _id: '5ee49c3115a4e75254bb7330',
        soldAt: "02-20-2020",
        customer: {_id: 'dummyId',},
        seller: {_id: 'dummyId',},
        liabilityInsurer: {_id: 'dummyId',},
        liabilityCharge: 1000.50,
        cargoInsurer: {_id: 'dummyId',},
        cargoCharge: 200.50,
        physicalDamageInsurer: {_id: 'dummyId',},
        physicalDamageCharge: 300.00,
        wcGlUmbInsurer: {_id: 'dummyId',},
        wcGlUmbCharge: 500.00,
        fees: 200,
        permits: 100,
        tips: 50,
        chargesPaid: 1200.00
      },
    ];
    jest.spyOn(model, 'find').mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(sales) as any,
        }),
      }),
    } as any);

    const data = await service.findAll().toPromise();
    expect(data.length).toBe(3);
    expect(model.find).toHaveBeenCalled();

    jest
      .spyOn(model, 'find')
      .mockImplementation(
        (
          conditions: FilterQuery<Sale>,
          callback?: (err: any, res: Sale[]) => void,
        ) => {
          return {
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([sales[0]]),
              }),
            }),
          } as any;
        },
      );

    const result = await service.findAll('Generate', 0, 10).toPromise();
    expect(result.length).toBe(1);
    expect(model.find).lastCalledWith({
      title: { $regex: '.*' + 'Generate' + '.*' },
    });
  });

  describe('findByid', () => {
    it('if exists return one sale', (done) => {
      const found = {
        _id: '5ee49c3115a4e75254bb732e',
        soldAt: "02-20-2020",
        customer: {_id: 'dummyId',},
        seller: {_id: 'dummyId',},
        liabilityInsurer: {_id: 'dummyId',},
        liabilityCharge: 1000.50,
        cargoInsurer: {_id: 'dummyId',},
        cargoCharge: 200.50,
        physicalDamageInsurer: {_id: 'dummyId',},
        physicalDamageCharge: 300.00,
        wcGlUmbInsurer: {_id: 'dummyId',},
        wcGlUmbCharge: 500.00,
        fees: 200,
        permits: 100,
        tips: 50,
        chargesPaid: 1200.00
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(found) as any,
      } as any);

      service.findById('1').subscribe({
        next: (data) => {
          expect(data._id).toBe('5ee49c3115a4e75254bb732f');
          expect(data.fees).toEqual(200);
        },
        error: (error) => console.log(error),
        complete: done(),
      });
    });

    it('if not found throw an NotFoundException', (done) => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null) as any,
      } as any);

      service.findById('1').subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          expect(error).toBeDefined();
        },
        complete: done(),
      });
    });
  });

  it('should save sale', async () => {
    const toCreated = {
      soldAt: "02-20-2020",
      customer: {_id: 'dummyId',},
      seller: {_id: 'dummyId',},
      liabilityInsurer: {_id: 'dummyId',},
      liabilityCharge: 1000.50,
      cargoInsurer: {_id: 'dummyId',},
      cargoCharge: 200.50,
      physicalDamageInsurer: {_id: 'dummyId',},
      physicalDamageCharge: 300.00,
      wcGlUmbInsurer: {_id: 'dummyId',},
      wcGlUmbCharge: 500.00,
      fees: 200,
      permits: 100,
      tips: 50,
      chargesPaid: 1200.00
    };

    const toReturned = {
      _id: '5ee49c3115a4e75254bb732e',
      ...toCreated,
    };

    jest.spyOn(model, 'create').mockResolvedValue(toReturned as never);

    const data = await service.save(toCreated).toPromise();
    expect(data._id).toBe('5ee49c3115a4e75254bb732e');
    expect(model.create).toBeCalledWith({
      ...toCreated
    });
    expect(model.create).toBeCalledTimes(1);
  });

  describe('update', () => {
    it('perform update if sale exists', (done) => {
      const toUpdated = {
        soldAt: "02-20-2020",
      customer: {_id: 'dummyId',},
      seller: {_id: 'dummyId',},
      liabilityInsurer: {_id: 'dummyId',},
      liabilityCharge: 1000.50,
      cargoInsurer: {_id: 'dummyId',},
      cargoCharge: 200.50,
      physicalDamageInsurer: {_id: 'dummyId',},
      physicalDamageCharge: 300.00,
      wcGlUmbInsurer: {_id: 'dummyId',},
      wcGlUmbCharge: 500.00,
      fees: 200,
      permits: 100,
      tips: 50,
      chargesPaid: 1200.00
      };

      jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(toUpdated) as any,
      } as any);

      service.update('5ee49c3115a4e75254bb732e', toUpdated).subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
          expect(model.findOneAndUpdate).toBeCalled();
        },
        error: (error) => console.log(error),
        complete: done(),
      });
    });

    it('throw an NotFoundException if sale not exists', (done) => {
      const toUpdated = {
        soldAt: "02-20-2020",
        customer: {_id: 'dummyId',},
        seller: {_id: 'dummyId',},
        liabilityInsurer: {_id: 'dummyId',},
        liabilityCharge: 1000.50,
        cargoInsurer: {_id: 'dummyId',},
        cargoCharge: 200.50,
        physicalDamageInsurer: {_id: 'dummyId',},
        physicalDamageCharge: 300.00,
        wcGlUmbInsurer: {_id: 'dummyId',},
        wcGlUmbCharge: 500.00,
        fees: 200,
        permits: 100,
        tips: 50,
        chargesPaid: 1200.00
    };
      jest.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null) as any,
      } as any);

      service.update('5ee49c3115a4e75254bb732e', toUpdated).subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
        },
        complete: done(),
      });
    });
  });

  describe('delete', () => {
    it('perform delete if sale exists', (done) => {
      const toDeleted = {
        soldAt: "02-20-2020",
      customer: {_id: 'dummyId',},
      seller: {_id: 'dummyId',},
      liabilityInsurer: {_id: 'dummyId',},
      liabilityCharge: 1000.50,
      cargoInsurer: {_id: 'dummyId',},
      cargoCharge: 200.50,
      physicalDamageInsurer: {_id: 'dummyId',},
      physicalDamageCharge: 300.00,
      wcGlUmbInsurer: {_id: 'dummyId',},
      wcGlUmbCharge: 500.00,
      fees: 200,
      permits: 100,
      tips: 50,
      chargesPaid: 1200.00
      };
      jest.spyOn(model, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(toDeleted),
      } as any);

      service.deleteById('anystring').subscribe({
        next: (data) => {
          expect(data).toBeTruthy();
          expect(model.findOneAndDelete).toBeCalled();
        },
        error: (error) => console.log(error),
        complete: done(),
      });
    });

    it('throw an NotFoundException if sale not exists', (done) => {
      jest.spyOn(model, 'findOneAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      service.deleteById('anystring').subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          expect(model.findOneAndDelete).toBeCalledTimes(1);
        },
        complete: done(),
      });
    });
  });

  it('should delete all sales', (done) => {
    jest.spyOn(model, 'deleteMany').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({
        deletedCount: 1,
      }),
    } as any);

    service.deleteAll().subscribe({
      next: (data) => expect(data).toBeTruthy,
      error: (error) => console.log(error),
      complete: done(),
    });
  });
});
