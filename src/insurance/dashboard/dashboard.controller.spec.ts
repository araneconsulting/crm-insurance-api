import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { anyNumber, anyString, instance, mock, verify, when } from 'ts-mockito';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardServiceStub } from './dashboard.service.stub';

describe('Dashboard Controller', () => {
  describe('Replace DashboardService in provider(useClass: DashboardServiceStub)', () => {
    let controller: DashboardController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: DashboardService,
            useClass: DashboardServiceStub,
          },
        ],
        controllers: [DashboardController],
      }).compile();

      controller = await module.resolve<DashboardController>(DashboardController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });



    describe('Replace DashboardService in provider(useValue: fake object)', () => {
      let controller: DashboardController;

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            {
              provide: DashboardService,
              useValue: {
                findAll: (_keyword?: string, _skip?: number, _limit?: number) =>
                  of<any[]>([
                    {
                      _id: 'testid',
                      title: 'test title',
                      content: 'test content',
                    },
                  ]),
              },
            },
          ],
          controllers: [DashboardController],
        }).compile();

        controller = await module.resolve<DashboardController>(DashboardController);
      });


      describe('Replace DashboardService in provider(useValue: jest mocked object)', () => {
        let controller: DashboardController;
        let dashboardService: DashboardService;

        beforeEach(async () => {
          const module: TestingModule = await Test.createTestingModule({
            providers: [
              {
                provide: DashboardService,
                useValue: {
                  constructor: jest.fn(),
                  findAll: jest
                    .fn()
                    .mockImplementation(
                      (_keyword?: string, _skip?: number, _limit?: number) =>
                        of<any[]>([
                          {
                            _id: 'testid',
                            title: 'test title',
                            content: 'test content',
                          },
                        ]),
                    ),
                },
              },
            ],
            controllers: [DashboardController],
          }).compile();

          controller = await module.resolve<DashboardController>(DashboardController);
          dashboardService = module.get<DashboardService>(DashboardService);
        });
      });
    }
    )
  })
});