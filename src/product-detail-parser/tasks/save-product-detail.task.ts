import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../database/entities/product.entity';
import { Repository } from 'typeorm';
import { ProductDetail } from '../../database/entities/product-detail.entity';
import { Logger } from '@nestjs/common';

export class SaveProductDetailTask {
  constructor(
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,
    private readonly logger: Logger,
  ) {}

  public async run(
    product: Product,
    language: string,
    source: string,
  ): Promise<ProductDetail> {
    const productDetail = new ProductDetail();
    productDetail.product = product;
    productDetail.language = language;
    productDetail.source = source;

    return await this.productDetailRepository
      .save(productDetail)
      .catch(async (error) => {
        this.logger.error(error.message);
        return await this.productDetailRepository
          .update({ product: product, language: language }, { source: source })
          .catch((error) => this.logger.error(error.message))
          .then(() => productDetail);
      });
  }
}
