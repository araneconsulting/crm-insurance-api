import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { of } from 'rxjs';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn()
          },
        },
      ],
      controllers: [UserController],
    }).compile();

    controller = app.get<UserController>(UserController);
    service = app.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getUser', async () => {
    jest.spyOn(service, "findById")
      .mockImplementationOnce((id: string, withPosts: boolean) => (of({
        username: 'admin',
        password: 'mysecret',
        email: 'admin@araneconsulting.com',
        firstName: "John",
        lastName: "Dowd",
        location: 'MEXICO',
        position: 'SYSTEM_ADMINISTRATOR',
        baseSalary: 800,
        saleBonusPercentage: 0.01,
      } as any)));
    const user = await controller.getUser("id", false).toPromise();
    expect(user.firstName).toBe("John");
    expect(user.lastName).toBe("Dowd");
    expect(service.findById).toBeCalledWith("id", false);
  });
});
