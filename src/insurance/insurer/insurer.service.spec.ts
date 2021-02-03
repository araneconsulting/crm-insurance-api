import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { FilterQuery, Model } from 'mongoose';
import { INSURER_MODEL } from '../../database/database.constants';
import { Insurer } from '../../database/insurer.model';
import { InsurerService} from './insurer.service';


describe('InsurerService', () => {
  let service: InsurerService;
  let model: Model<Insurer>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsurerService,
        {
          provide: INSURER_MODEL,
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

    service = await module.resolve<InsurerService>(InsurerService);
    model = module.get<Model<Insurer>>(INSURER_MODEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all insurers', async () => {
    const insurers = [
      {
        _id: '5ee49c3115a4e75254bb732e',
        isCompany: true,
        name: 'FutureSoft',
        email: 'aliesky@example.com',
        phone: '832-555-5555',
      },
      {
        _id: '5ee49c3115a4e75254bb732f',
        isCompany: true,
        name: 'World Records',
        email: 'ernesto@example.com',
        phone: '832-111-3333',
      },
      {
        _id: '5ee49c3115a4e75254bb7330',
        isCompany: true,
        name: 'TED SuperStars',
        email: 'ernesto@example.com',
        phone: '832-222-8888',
      },
    ];
    jest.spyOn(model, 'find').mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(insurers) as any,
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
          conditions: FilterQuery<Insurer>,
          callback?: (err: any, res: Insurer[]) => void,
        ) => {
          return {
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([insurers[0]]),
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
    it('if exists return one insurer', (done) => {
      const found = {
        _id: '5ee49c3115a4e75254bb732e',
        isCompany: true,
        name: 'FutureSoft',
        email: 'aliesky@example.com',
        phone: '832-555-5555',
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(found) as any,
      } as any);

      service.findById('1').subscribe({
        next: (data) => {
          expect(data._id).toBe('5ee49c3115a4e75254bb732f');
          expect(data.name).toEqual('Ernesto');
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

  it('should save insurer', async () => {
    const toCreated = {
      name: 'Triple-Sured LLC',
      email: '3sured@example.com',
      phone: '832-888-5335',
      liabilityCommission: 0.1,
      cargoCommission: 0.1,
      physicalDamageCommission: 0.08,
      wcGlUmbCommission: 0.1
    };

    const toReturned = {
      _id: '5ee49c3115a4e75254bb732e',
      ...toCreated,
    };

    jest.spyOn(model, 'create').mockResolvedValue(toReturned as never);

    const data = await service.save(toCreated).toPromise();
    expect(data._id).toBe('5ee49c3115a4e75254bb732e');
    expect(model.create).toBeCalledWith({
      ...toCreated,
      createdBy: {
        _id: 'dummyId',
      },
    });
    expect(model.create).toBeCalledTimes(1);
  });

  describe('update', () => {
    it('perform update if insurer exists', (done) => {
      const toUpdated = {
        name: 'Triple-Sured LLC',
        email: '3sured@example.com',
        phone: '832-888-5335',
        liabilityCommission: 0.1,
        cargoCommission: 0.1,
        physicalDamageCommission: 0.08,
        wcGlUmbCommission: 0.1
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

    it('throw an NotFoundException if insurer not exists', (done) => {
      const toUpdated = {
      name: 'Triple-Sured LLC',
      email: '3sured@example.com',
      phone: '832-888-5335',
      liabilityCommission: 0.1,
      cargoCommission: 0.1,
      physicalDamageCommission: 0.08,
      wcGlUmbCommission: 0.1
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
    it('perform delete if insurer exists', (done) => {
      const toDeleted = {
        name: 'Triple-Sured LLC',
        email: '3sured@example.com',
        phone: '832-888-5335',
        liabilityCommission: 0.1,
        cargoCommission: 0.1,
        physicalDamageCommission: 0.08,
        wcGlUmbCommission: 0.1
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

    it('throw an NotFoundException if insurer not exists', (done) => {
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

  it('should delete all insurers', (done) => {
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
