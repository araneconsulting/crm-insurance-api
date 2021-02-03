import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { anyNumber, anyString, instance, mock, verify, when } from 'ts-mockito';
import { Insurer } from '../../database/insurer.model';
import { InsurerController } from './insurer.controller';
import { InsurerService } from './insurer.service';
import { InsurerServiceStub } from './insurer.service.stub';

describe('Insurer Controller', () => {
  describe('Replace InsurerService in provider(useClass: InsurerServiceStub)', () => {
    let controller: InsurerController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: InsurerService,
            useClass: InsurerServiceStub,
          },
        ],
        controllers: [InsurerController],
      }).compile();

      controller = await module.resolve<InsurerController>(InsurerController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('GET on /insurers should return all insurers', async () => {
      const insurers = await controller.getAllInsurers().toPromise();
      expect(insurers.length).toBe(3);
    });

    it('GET on /insurers/:id should return one insurer ', (done) => {
      controller.getInsurerById('1').subscribe((data) => {
        expect(data._id).toEqual('1');
        done();
      });
    });

 /*    it('POST on /insurers should save insurer', async () => {
      const insurer: CreateInsurerDto = {
        isCompany: true,
        name: 'TestSoft',
        email: 'test@example.com',
        phone: '832-111-1111',
      };
      const saved = await controller
        .createInsurer(
          insurer,
          createMock<Response>({
            location: jest.fn().mockReturnValue({
              status: jest.fn().mockReturnValue({
                send: jest.fn().mockReturnValue({
                  headers: { location: '/insurers/insurer_id' },
                  status: 201,
                }),
              }),
            }),
          }),
        )
        .toPromise();
      // console.log(saved);
      expect(saved.status).toBe(201);
    });

    it('PUT on /insurers/:id should update the existing insurer', (done) => {
      const insurer: UpdateInsurerDto = {
        firstName: 'Test',
        lastName: 'Test',
        name: 'TestSoft',
        email: 'test@example.com',
        phone: '832-111-1111',
      };
      controller
        .updateInsurer(
          '1',
          insurer,
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 204,
              }),
            }),
          }),
        )
        .subscribe((data) => {
          expect(data.status).toBe(204);
          done();
        });
    });

    it('DELETE on /insurers/:id should delete insurer', (done) => {
      controller
        .deleteInsurerById(
          '1',
          createMock<Response>({
            status: jest.fn().mockReturnValue({
              send: jest.fn().mockReturnValue({
                status: 204,
              }),
            }),
          }),
        )
        .subscribe((data) => {
          expect(data).toBeTruthy();
          done();
        });
    }); */
  });

  describe('Replace InsurerService in provider(useValue: fake object)', () => {
    let controller: InsurerController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: InsurerService,
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
        controllers: [InsurerController],
      }).compile();

      controller = await module.resolve<InsurerController>(InsurerController);
    });

    it('should get all insurers(useValue: fake object)', async () => {
      const result = await controller.getAllInsurers().toPromise();
      expect(result[0]._id).toEqual('testid');
    });
  });

  describe('Replace InsurerService in provider(useValue: jest mocked object)', () => {
    let controller: InsurerController;
    let insurerService: InsurerService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: InsurerService,
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
        controllers: [InsurerController],
      }).compile();

      controller = await module.resolve<InsurerController>(InsurerController);
      insurerService = module.get<InsurerService>(InsurerService);
    });

    it('should get all insurers(useValue: jest mocking)', async () => {
      const result = await controller.getAllInsurers('test', 10, 0).toPromise();
      expect(result[0]._id).toEqual('testid');
      expect(insurerService.findAll).toBeCalled();
      expect(insurerService.findAll).lastCalledWith('test', 0, 10);
    });
  });

  describe('Mocking InsurerService using ts-mockito', () => {
    let controller: InsurerController;
    const mockedInsurerService: InsurerService = mock(InsurerService);

    beforeEach(async () => {
      controller = new InsurerController(instance(mockedInsurerService));
    });

    it('should get all insurers(ts-mockito)', async () => {
      when(
        mockedInsurerService.findAll(anyString(), anyNumber(), anyNumber()),
      ).thenReturn(
        of([
          {
            _id: 'testid', 
            name: 'Test',
            email: 'test@example.com',
            phone: '832-111-1111',
          },
        ]) as Observable<Insurer[]>,
      );
      const result = await controller.getAllInsurers('', 10, 0).toPromise();
      expect(result.length).toEqual(1);
      expect(result[0].name).toBe('Test');
      verify(
        mockedInsurerService.findAll(anyString(), anyNumber(), anyNumber()),
      ).once();
    });
  });
});
