import { Test, TestingModule } from '@nestjs/testing';
import { anyString } from 'ts-mockito';
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
      const sales = await controller.findAll(null,null);
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
      const result = await controller.findAll(null,null);
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
      const result = await controller.findAll(null,null,anyString(),anyString());
      expect(result[0]._id).toEqual('testid');
      expect(saleService.findAll).toBeCalled();
      expect(saleService.findAll).lastCalledWith('test', 0, 10);
    });
  });

  
});
