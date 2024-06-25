import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { GetProductListTask } from './get-product-list.task';

describe('GetProductListTask', () => {
  let task: GetProductListTask;
  let productRepository: Repository<Product>;

  const mockProductRepository = {
    find: jest.fn().mockResolvedValue([
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductListTask,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    task = module.get<GetProductListTask>(GetProductListTask);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(task).toBeDefined();
  });

  it('should return a list of products', async () => {
    const result = await task.run();
    expect(result).toEqual([
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ]);
    expect(productRepository.find).toHaveBeenCalledWith({ take: 2 });
  });

  it('should call the repository find method', async () => {
    await task.run();
    expect(productRepository.find).toHaveBeenCalled();
  });
});
