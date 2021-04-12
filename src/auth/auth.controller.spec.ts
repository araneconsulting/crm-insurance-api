import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            constructor: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return accessToken', async () => {
      jest.spyOn(authService, 'login').mockImplementation((user: any) => {
        return of({ accessToken: 'jwttoken' });
      });


      const token = await controller.login({} as any,
        createMock<Response>({
          header: jest.fn().mockReturnValue({

            json: jest.fn().mockReturnValue({

              send: jest.fn().mockReturnValue({
                header: { authorization: 'Bearer test' },
              }),

            }),
          }),
        })
      ).toPromise();
      expect(token).toBeTruthy();
      expect(authService.login).toBeCalled();
    });
  });
});
