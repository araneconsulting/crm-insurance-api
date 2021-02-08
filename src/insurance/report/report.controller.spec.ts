import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { anyNumber, anyString, instance, mock, verify, when } from 'ts-mockito';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportServiceStub } from './report.service.stub';

describe('Report Controller', () => {
  describe('Replace ReportService in provider(useClass: ReportServiceStub)', () => {
    let controller: ReportController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: ReportService,
            useClass: ReportServiceStub,
          },
        ],
        controllers: [ReportController],
      }).compile();

      controller = await module.resolve<ReportController>(ReportController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });



    describe('Replace ReportService in provider(useValue: fake object)', () => {
      let controller: ReportController;

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            {
              provide: ReportService,
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
          controllers: [ReportController],
        }).compile();

        controller = await module.resolve<ReportController>(ReportController);
      });


      describe('Replace ReportService in provider(useValue: jest mocked object)', () => {
        let controller: ReportController;
        let reportService: ReportService;

        beforeEach(async () => {
          const module: TestingModule = await Test.createTestingModule({
            providers: [
              {
                provide: ReportService,
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
            controllers: [ReportController],
          }).compile();

          controller = await module.resolve<ReportController>(ReportController);
          reportService = module.get<ReportService>(ReportService);
        });
      });
    }
    )
  })
});