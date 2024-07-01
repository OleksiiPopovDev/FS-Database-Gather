import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { GetProductListTask } from './get-product-list.task';

describe('GetProductListTask', () => {
  let getProductListTask: GetProductListTask;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductListTask,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    getProductListTask = module.get<GetProductListTask>(GetProductListTask);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(getProductListTask).toBeDefined();
  });

  it('should return products with non-null energy, protein, fat, or carbohydrates and no details', async () => {
    const mockProducts = [
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
      },
    ] as Product[];

    const queryBuilder =
      productRepository.createQueryBuilder() as unknown as SelectQueryBuilder<Product>;
    (queryBuilder.getMany as jest.Mock).mockResolvedValue(mockProducts);

    const products = await getProductListTask.run(0, 10);
    expect(products).toEqual(mockProducts);
  });

  it('should return count of products with non-null energy, protein, fat, or carbohydrates and no details', async () => {
    const queryBuilder =
      productRepository.createQueryBuilder() as unknown as SelectQueryBuilder<Product>;
    (queryBuilder.getCount as jest.Mock).mockResolvedValue(1);

    const count = await getProductListTask.count();
    expect(count).toBe(1);
  });
});
