import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { of } from 'rxjs';
import { RoleType } from '../shared/enum/role-type.enum';
import { USER_MODEL } from '../database/database.constants';
import { User } from '../database/user.model';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;
  let sendgrid: SendgridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_MODEL,
          useValue: {
            findOne: jest.fn(),
            exists: jest.fn(),
            create: jest.fn()
          },
        },
        {
          provide: SendgridService,
          useValue: {
            send: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    sendgrid = module.get<SendgridService>(SendgridService);
    model = module.get<Model<User>>(USER_MODEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('save ', async () => {
    const sampleData = {
      username: 'liuver',
      email: 'liuver@example.com',
      firstName: 'Liuver',
      lastName: 'Duran',
      password: 'mysecret',
      location: 'MEXICO',
      position: 'SELLER',
      baseSalary: 400,
    }

    const msg = {
      from: 'service@example.com', // Use the email address or domain you verified above
      subject: 'Welcome to Nestjs Sample',
      templateId: "welcome",
      personalizations: [
        {
          to: 'liuver@example.com',
          dynamicTemplateData: { name: 'Liuver Duran' },
        }
      ]

    };

    const saveSpy = jest.spyOn(model, 'create').mockResolvedValue({
      _id: '123',
      ...sampleData
    } as never);

    const pipeMock = {
      pipe: jest.fn()
    }

    const pipeSpy = jest.spyOn(pipeMock, 'pipe');

    const sendSpy = jest.spyOn(sendgrid, 'send')
      .mockImplementation((data: any) => { return of(pipeMock) });

    const result = await service.register(sampleData).toPromise();
    expect(saveSpy).toBeCalledWith({ ...sampleData, roles: [RoleType.SELLER] });
    expect(result._id).toBeDefined();
    //expect(sendSpy).toBeCalledWith(msg);
    //expect(pipeSpy).toBeCalled();
  });

  it('findByUsername should return user', async () => {
    jest
      .spyOn(model, 'findOne')
      .mockImplementation((conditions: any, projection: any, options: any) => {
        return {
          exec: jest.fn().mockResolvedValue({
            username: 'liuver',
            email: 'liuver@example.com',
          } as User),
        } as any;
      });

    const foundUser = await service.findByUsername('liuver').toPromise();
    expect(foundUser).toEqual({
      username: 'liuver',
      email: 'liuver@example.com',
    });
    expect(model.findOne).lastCalledWith({ username: 'liuver' });
    expect(model.findOne).toBeCalledTimes(1);
  });

  describe('findById', () => {
    it('return one result', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockImplementation((conditions: any, projection: any, options: any) => {
          return {
            exec: jest.fn().mockResolvedValue({
              username: 'liuver',
              email: 'liuver@example.com',
            } as User),
          } as any;
        });

      const foundUser = await service.findById('liuver').toPromise();
      expect(foundUser).toEqual({
        username: 'liuver',
        email: 'liuver@example.com',
      });
      expect(model.findOne).lastCalledWith({ _id: 'liuver' });
      expect(model.findOne).toBeCalledTimes(1);
    });

    it('return a null result', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockImplementation((conditions: any, projection: any, options: any) => {
          return {
            exec: jest.fn().mockResolvedValue(null) as any,
          } as any;
        });

      try {
        const foundUser = await service.findById('liuver').toPromise();
      } catch (e) {
        expect(e).toBeDefined();
      }
    });


    it('parameter withPosts=true', async () => {
      jest
        .spyOn(model, 'findOne')
        .mockImplementation((conditions: any, projection: any, options: any) => {
          return {
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue({
              username: 'liuver',
              email: 'liuver@example.com',
            } as User),
          } as any;
        });

      const foundUser = await service.findById('liuver', true).toPromise();
      expect(foundUser).toEqual({
        username: 'liuver',
        email: 'liuver@example.com',
      });
      expect(model.findOne).lastCalledWith({ _id: 'liuver' });
      expect(model.findOne).toBeCalledTimes(1);
    });
  });

  describe('existsByUsername', () => {

    it('should return true if exists ', async () => {
      const existsSpy = jest.spyOn(model, 'exists').mockResolvedValue(true as never);
      const result = await service.existsByUsername('liuver').toPromise();

      expect(existsSpy).toBeCalledWith({ username: 'liuver' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeTruthy();
    });

    it('should return false if not exists ', async () => {
      const existsSpy = jest.spyOn(model, 'exists').mockResolvedValue(false as never);
      const result = await service.existsByUsername('liuver').toPromise();

      expect(existsSpy).toBeCalledWith({ username: 'liuver' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeFalsy();
    });
  });

  describe('existsByEmail', () => {

    it('should return true if exists ', async () => {
      const existsSpy = jest.spyOn(model, 'exists').mockResolvedValue(true as never);
      const result = await service.existsByEmail('liuver@example.com').toPromise();

      expect(existsSpy).toBeCalledWith({ email: 'liuver@example.com' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeTruthy();
    });

    it('should return false if not exists ', async () => {
      const existsSpy = jest.spyOn(model, 'exists').mockResolvedValue(false as never);
      const result = await service.existsByEmail('liuver@example.com').toPromise();

      expect(existsSpy).toBeCalledWith({ email: 'liuver@example.com' });
      expect(existsSpy).toBeCalledTimes(1);
      expect(result).toBeFalsy();
    });
  });
});
