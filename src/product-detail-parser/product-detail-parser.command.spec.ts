import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { GetProductListTask } from './tasks/get-product-list.task';
import { RequesterService } from '../rest-api/requester.service';
import { SaveProductDetailTask } from './tasks/save-product-detail.task';
import { ProductDetailParserCommand } from './product-detail-parser.command';
import { Product } from '../database/entities/product.entity';
import * as cliProgress from 'cli-progress';

jest.mock('cli-progress');

describe('ProductDetailParserCommand', () => {
  let productDetailParserCommand: ProductDetailParserCommand;
  let getProductListTask: GetProductListTask;
  let requesterService: RequesterService;
  let saveProductDetailTask: SaveProductDetailTask;
  let configService: ConfigService;
  let logger: Logger;
  let progressBar: cliProgress.SingleBar;

  beforeEach(async () => {
    progressBar = new cliProgress.SingleBar();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductDetailParserCommand,
        {
          provide: GetProductListTask,
          useValue: {
            run: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: RequesterService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SaveProductDetailTask,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'REQUEST_QUEUE_LENGTH') return '10';
              if (key === 'REQUEST_TIMEOUT') return '1000';
              if (key === 'SOURCE_PRODUCT_URL')
                return 'http://example.com/{STORE_ID}/{EAN}';
              if (key === 'SOURCE_LANGUAGES') return 'en,fr,de';
              return null;
            }),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    productDetailParserCommand = module.get<ProductDetailParserCommand>(
      ProductDetailParserCommand,
    );
    getProductListTask = module.get<GetProductListTask>(GetProductListTask);
    requesterService = module.get<RequesterService>(RequesterService);
    saveProductDetailTask = module.get<SaveProductDetailTask>(
      SaveProductDetailTask,
    );
    configService = module.get<ConfigService>(ConfigService);
    logger = module.get<Logger>(Logger);

    (cliProgress.SingleBar as jest.Mock).mockImplementation(() => progressBar);
    progressBar.start = jest.fn();
    progressBar.update = jest.fn();
    progressBar.stop = jest.fn();
  });

  it('should be defined', () => {
    expect(productDetailParserCommand).toBeDefined();
  });

  describe('run', () => {
    it('should execute the command and process products', async () => {
      const mockProducts: Product[] = [
        {
          id: 1,
          ean: '1234567890123',
          storeId: '1',
          energy: '100',
          protein: '10',
          fat: '5',
          carbohydrates: '20',
          source: '{}',
          detail_source: '{}',
          details: null,
        } as Product,
      ];

      getProductListTask.count = jest.fn().mockResolvedValue(1);
      getProductListTask.run = jest.fn().mockResolvedValue(mockProducts);
      requesterService.get = jest
        .fn()
        .mockResolvedValue({ product: { ean: '1234567890123' } });
      saveProductDetailTask.run = jest
        .fn()
        .mockResolvedValue({ product: { id: 1 }, language: 'en' });

      await productDetailParserCommand.run();

      expect(getProductListTask.count).toHaveBeenCalled();
      expect(getProductListTask.run).toHaveBeenCalledWith(0, 10);
      expect(requesterService.get).toHaveBeenCalled();
      expect(saveProductDetailTask.run).toHaveBeenCalled();
      expect(progressBar.start).toHaveBeenCalledWith(1, 0);
      expect(progressBar.update).toHaveBeenCalledWith(1);
      expect(progressBar.stop).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Test Error');

      getProductListTask.count = jest.fn().mockRejectedValue(mockError);

      await productDetailParserCommand.run();

      expect(logger.error).toHaveBeenCalledWith(
        'Error in running the product detail parser command',
        'Test Error',
      );
    });
  });
});
