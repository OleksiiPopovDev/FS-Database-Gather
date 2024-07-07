import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { ConfigService } from '@nestjs/config';
import { GetProductListTask } from './tasks/get-product-list.task';
import { RequesterService } from '../rest-api/requester.service';
import { SaveProductDetailTask } from './tasks/save-product-detail.task';
import { Product } from '../database/entities/product.entity';
import { Promise as BluebirdPromise } from 'bluebird';
import * as cliProgress from 'cli-progress';
import { HttpRequestType, HttpResponseType } from './types/product-detail.type';

@Command({
  name: 'product-detail-parse',
  description: 'Parse product detail',
})
export class ProductDetailParserCommand extends CommandRunner {
  constructor(
    private readonly getProductListTask: GetProductListTask,
    private readonly requesterService: RequesterService,
    private readonly saveProductDetailTask: SaveProductDetailTask,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    super();
  }
  private currentProcessed: number = 0;
  private processedRecords: number = 0;
  private progressBar: cliProgress.SingleBar;

  public async run() {
    try {
      this.progressBar = new cliProgress.SingleBar({
        format:
          'Progress |{bar}| {percentage}% || {value}/{total} Chunks || ETA: {eta_formatted}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      });

      this.logger.log('Counting total number of products...');
      this.processedRecords = await this.getProductListTask.countProcesses();
      const unprocessedRecords = await this.getProductListTask.count();
      const totalRecords = this.processedRecords + unprocessedRecords;
      this.progressBar.start(totalRecords, 0);
      this.progressBar.update(this.processedRecords);

      while (this.currentProcessed < unprocessedRecords) {
        const products = await this.getProductListTask.run(
          this.currentProcessed,
          this.getQueueLength(),
        );
        await BluebirdPromise.map(products, this.taskHandler, {
          concurrency: this.getQueueLength(),
        });
      }

      this.progressBar.stop();
    } catch (error) {
      this.logger.error(
        'Error in running the product detail parser command',
        error.message,
      );
    }
  }

  private getQueueLength(): number {
    return Number(this.configService.get<number>('REQUEST_QUEUE_LENGTH')) || 10;
  }

  private readonly taskHandler = async (product: Product) => {
    try {
      this.currentProcessed++;
      this.progressBar.update(this.processedRecords + this.currentProcessed);

      const requests = this.prepareRequests(product);
      for (const request of requests) {
        const response = await this.fetchProductDetails(request);
        await this.saveProductDetails(product, request.language, response);
      }

      await BluebirdPromise.delay(
        Number(this.configService.get<number>('REQUEST_TIMEOUT')),
      );
    } catch (error) {
      this.logger.error('Error in processing product', error.message);
    }
  };

  private async fetchProductDetails(
    request: HttpRequestType,
  ): Promise<HttpResponseType> {
    return await this.requesterService.get<HttpResponseType>(request);
  }

  private async saveProductDetails(
    product: Product,
    language: string,
    response: HttpResponseType,
  ) {
    const productDetail = await this.saveProductDetailTask.run(
      product,
      language,
      JSON.stringify(response),
    );

    // this.logger.log(
    //   `Saved product detail for product ID: ${productDetail.product.id}, Language: ${productDetail.language}`,
    // );
  }

  private prepareRequests(product: Product): HttpRequestType[] {
    const sourceUrl = this.configService.get<string>('SOURCE_PRODUCT_URL');
    const languageList = this.getLanguageList();

    const url = sourceUrl
      .replace('{STORE_ID}', product.storeId)
      .replace('{EAN}', product.ean);

    return languageList.map((lang): HttpRequestType => {
      return {
        language: lang,
        url: url,
        config: { headers: { 'Accept-Language': lang } },
      };
    });
  }

  private getLanguageList(): string[] {
    return (
      this.configService
        .get<string>('SOURCE_LANGUAGES')
        ?.replaceAll(' ', '')
        ?.toLowerCase()
        ?.split(',') || []
    );
  }
}
