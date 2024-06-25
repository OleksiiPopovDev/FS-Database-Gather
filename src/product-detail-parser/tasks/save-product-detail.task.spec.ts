import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { ProductDetail } from '../../database/entities/product-detail.entity';
import { Logger } from '@nestjs/common';
import { SaveProductDetailTask } from './save-product-detail.task';

describe('SaveProductDetailTask', () => {
  let task: SaveProductDetailTask;
  let productDetailRepository: Repository<ProductDetail>;
  let logger: Logger;

  const mockProductDetailRepository = {
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockLogger = {
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveProductDetailTask,
        {
          provide: getRepositoryToken(ProductDetail),
          useValue: mockProductDetailRepository,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    task = module.get<SaveProductDetailTask>(SaveProductDetailTask);
    productDetailRepository = module.get<Repository<ProductDetail>>(
      getRepositoryToken(ProductDetail),
    );
    logger = module.get<Logger>(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(task).toBeDefined();
  });

  it('should save product detail successfully', async () => {
    const product = new Product();
    const productDetail = new ProductDetail();
    productDetail.product = product;
    productDetail.language = 'en';
    productDetail.source = 'some source';

    mockProductDetailRepository.save.mockResolvedValue(productDetail);

    const result = await task.run(product, 'en', 'some source');

    expect(result).toEqual(productDetail);
    expect(mockProductDetailRepository.save).toHaveBeenCalledWith(
      productDetail,
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should handle duplicate entry error and update the product detail', async () => {
    const product = new Product();
    const productDetail = new ProductDetail();
    productDetail.product = product;
    productDetail.language = 'en';
    productDetail.source = 'some source';

    mockProductDetailRepository.save.mockRejectedValue(
      new Error('Duplicate entry'),
    );
    mockProductDetailRepository.update.mockResolvedValue({ affected: 1 });

    const result = await task.run(product, 'en', 'some source');

    expect(result).toEqual(productDetail);
    expect(mockProductDetailRepository.save).toHaveBeenCalledWith(
      productDetail,
    );
    expect(mockProductDetailRepository.update).toHaveBeenCalledWith(
      { product: product, language: 'en' },
      { source: 'some source' },
    );
    expect(logger.error).toHaveBeenCalledWith('Duplicate entry');
  });

  it('should log error if update fails', async () => {
    const product = new Product();
    const productDetail = new ProductDetail();
    productDetail.product = product;
    productDetail.language = 'en';
    productDetail.source = 'some source';

    mockProductDetailRepository.save.mockRejectedValue(
      new Error('Duplicate entry'),
    );
    mockProductDetailRepository.update.mockRejectedValue(
      new Error('Update failed'),
    );

    const result = await task.run(product, 'en', 'some source');

    expect(result).toEqual(productDetail);
    expect(mockProductDetailRepository.save).toHaveBeenCalledWith(
      productDetail,
    );
    expect(mockProductDetailRepository.update).toHaveBeenCalledWith(
      { product: product, language: 'en' },
      { source: 'some source' },
    );
    expect(logger.error).toHaveBeenCalledWith('Duplicate entry');
    expect(logger.error).toHaveBeenCalledWith('Update failed');
  });
});
