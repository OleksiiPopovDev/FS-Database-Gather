import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.entity';
import { ProductDetail } from '../database/entities/product-detail.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Promise } from 'bluebird';
import { firstValueFrom } from 'rxjs';
import { HttpRequestType } from './type/product-detail.type';

@Command({
  name: 'product-detail-parse',
  description: 'Parse product detail',
})
export class ProductDetailParserCommand extends CommandRunner {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly logger: Logger,
  ) {
    super();
  }
  public async run() {
    const products = await this.productRepository.find({ take: 10 });

    const task = async (request: HttpRequestType) => {
      const response = await firstValueFrom(
        this.httpService.get(request.url, request.config),
      );
      const requestTimeout = Number(this.config.get<number>('REQUEST_TIMEOUT'));
      this.logger.warn(
        `EAN: ${response.data.product.ean}; Title: ${response.data.product.title}`,
      );

      const responseData = response?.data?.product;

      if (!responseData) {
        throw new Error('No data');
      }

      const productDetail = new ProductDetail();
      productDetail.ean = response.data.product.ean;
      productDetail.language = request.config.headers['Accept-Language'];
      productDetail.title = response.data.product.title;
      productDetail.description = response.data.product.description;
      productDetail.source = JSON.stringify(response.data.product);

      await this.productDetailRepository
        .save(productDetail)
        .catch((error) => this.logger.error(error.message));
      await Promise.delay(requestTimeout);
    };

    const queueLength: number = Number(
      this.config.get<number>('REQUEST_QUEUE_LENGTH'),
    );
    const promiseConfig = { concurrency: queueLength || 10 };

    await Promise.map(this.prepareRequests(products), task, promiseConfig);
  }

  private prepareRequests(products: Product[]): HttpRequestType[] {
    const sourceUrl = this.config.get<string>('SOURCE_PRODUCT_URL');
    const languageList = this.config
      .get<string>('SOURCE_LANGUAGES')
      ?.replaceAll(' ', '')
      ?.toLowerCase()
      ?.split(',');

    return products.flatMap((product: Product): HttpRequestType[] => {
      const url = sourceUrl
        .replace('{STORE_ID}', product.storeId)
        .replace('{EAN}', product.ean);

      return languageList.map((lang): HttpRequestType => {
        return { url: url, config: { headers: { 'Accept-Language': lang } } };
      });
    });
  }
}
