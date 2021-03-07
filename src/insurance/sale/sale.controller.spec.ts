import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { anyNumber, anyString, instance, mock, verify, when } from 'ts-mockito';
import { Sale } from '../../database/sale.model';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';
import { SaleServiceStub } from './sale.service.stub';

describe('Sale Controller', () => {
  describe('Replace SaleService in provider(useClass: SaleServiceStub)', () => {
    let controller: SaleController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: SaleService,
            useClass: SaleServiceStub,
          },
        ],
        controllers: [SaleController],
      }).compile();

      controller = await module.resolve<SaleController>(SaleController);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('GET on /sales should return all sales', async () => {
      const sales = await controller.getAllSales(null,null).toPromise();
      expect(sales.length).toBe(3);
    });

    it('GET on /sales/:id should return one sale ', (done) => {
      controller.getSaleById('1').subscribe((data) => {
        expect(data._id).toEqual('1');
        done();
      });
    });
  });

  describe('Replace SaleService in provider(useValue: fake object)', () => {
    let controller: SaleController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: SaleService,
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
        controllers: [SaleController],
      }).compile();

      controller = await module.resolve<SaleController>(SaleController);
    });

    it('should get all sales(useValue: fake object)', async () => {
      const result = await controller.getAllSales(null,null).toPromise();
      expect(result[0]._id).toEqual('testid');
    });
  });

  describe('Replace SaleService in provider(useValue: jest mocked object)', () => {
    let controller: SaleController;
    let saleService: SaleService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: SaleService,
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
        controllers: [SaleController],
      }).compile();

      controller = await module.resolve<SaleController>(SaleController);
      saleService = module.get<SaleService>(SaleService);
    });

    it('should get all sales(useValue: jest mocking)', async () => {
      const result = await controller.getAllSales('test', 10, 0).toPromise();
      expect(result[0]._id).toEqual('testid');
      expect(saleService.findAll).toBeCalled();
      expect(saleService.findAll).lastCalledWith('test', 0, 10);
    });
  });

  describe('Mocking SaleService using ts-mockito', () => {
    let controller: SaleController;
    const mockedSaleService: SaleService = mock(SaleService);

    beforeEach(async () => {
      controller = new SaleController(instance(mockedSaleService));
    });

    it('should get all sales(ts-mockito)', async () => {
      when(
        mockedSaleService.findAll(anyString(), anyNumber(), anyNumber()),
      ).thenReturn(
        of([
          {
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
          }
        ]) as Observable<Sale[]>,
      );
      const result = await controller.getAllSales('', 10, 0).toPromise();
      expect(result.length).toEqual(1);
      expect(result[0].fees).toBe(200);
      verify(
        mockedSaleService.findAll(anyString(), anyNumber(), anyNumber()),
      ).once();
    });
  });
});
