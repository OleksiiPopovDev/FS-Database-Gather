import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { ProductDetail } from '../../database/entities/product-detail.entity';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetProductListTask } from './get-product-list.task';

describe('GetProductListTask', () => {
  let task: GetProductListTask;
  let productRepository: Repository<Product>;
  let productDetailRepository: Repository<ProductDetail>;
  let configService: ConfigService;

  const mockProducts: Product[] = [
    {
      id: 1,
      ean: '123',
      storeId: '1',
      energy: '100',
      protein: '10',
      fat: '5',
      carbohydrates: '20',
    } as Product,
    {
      id: 2,
      ean: '456',
      storeId: '1',
      energy: '200',
      protein: '20',
      fat: '10',
      carbohydrates: '40',
    } as Product,
  ];

  const mockProductRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockProducts),
      getCount: jest.fn().mockResolvedValue(2),
    }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'REQUEST_QUEUE_LENGTH':
          return '2';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductListTask,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        { provide: getRepositoryToken(ProductDetail), useValue: {} },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    task = module.get<GetProductListTask>(GetProductListTask);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    productDetailRepository = module.get<Repository<ProductDetail>>(
      getRepositoryToken(ProductDetail),
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(task).toBeDefined();
  });

  it('should return products in batches of specified size', async () => {
    const mockProductsBatch = [
      {
        id: 1,
        ean: '123',
        storeId: '1',
        energy: '100',
        protein: '10',
        fat: '5',
        carbohydrates: '20',
      } as Product,
      {
        id: 2,
        ean: '456',
        storeId: '1',
        energy: '200',
        protein: '20',
        fat: '10',
        carbohydrates: '40',
      } as Product,
    ];

    mockProductRepository
      .createQueryBuilder()
      .getMany.mockResolvedValueOnce(mockProductsBatch)
      .mockResolvedValueOnce([]);

    const result = [];
    for await (const products of task.run()) {
      result.push(...products);
    }

    expect(result).toEqual(mockProductsBatch);
    expect(
      mockProductRepository.createQueryBuilder().skip,
    ).toHaveBeenCalledWith(0);
    expect(
      mockProductRepository.createQueryBuilder().take,
    ).toHaveBeenCalledWith(2);
    expect(
      mockProductRepository.createQueryBuilder().getMany,
    ).toHaveBeenCalled();
  });

  it('should count the total number of products', async () => {
    const count = 42;
    mockProductRepository
      .createQueryBuilder()
      .getCount.mockResolvedValue(count);

    const result = await task.count();

    expect(result).toBe(count);
    expect(
      mockProductRepository.createQueryBuilder().where,
    ).toHaveBeenCalledWith(
      '(p.energy IS NOT NULL OR p.protein IS NOT NULL OR p.fat IS NOT NULL OR p.carbohydrates IS NOT NULL)',
    );
    expect(
      mockProductRepository.createQueryBuilder().andWhere,
    ).toHaveBeenCalledWith('pd.id IS NULL');
    expect(
      mockProductRepository.createQueryBuilder().getCount,
    ).toHaveBeenCalled();
  });
});
