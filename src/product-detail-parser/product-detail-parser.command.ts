import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { Product } from '../database/entities/product.entity';
import { ConfigService } from '@nestjs/config';
import { Promise as BluebirdPromise } from 'bluebird';
import { HttpRequestType } from './types/product-detail.type';
import { GetProductListTask } from './tasks/get-product-list.task';
import { RequesterService } from '../rest-api/requester.service';
import { SaveProductDetailTask } from './tasks/save-product-detail.task';
import * as cliProgress from 'cli-progress';

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
  private readonly progressBar = new cliProgress.SingleBar(
    {
      format:
        'Progress |{bar}| {percentage}% || {value}/{total} Chunks || ETA: {eta_formatted}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  );
  public async run() {
    try {
      this.logger.log('Counting the number of products...');
      const productsCount = await this.getProductListTask.count();
      this.progressBar.start(productsCount, 0);
      const productsGenerator = this.getProductListTask.run();
      const promiseConfig = { concurrency: this.getQueueLength() };

      for await (const products of productsGenerator) {
        await BluebirdPromise.map(products, this.taskHandler, promiseConfig);
      }
      this.progressBar.stop();
    } catch (error) {
      this.logger.error(
        'Error in running the product detail parser command',
        error.message,
      );
      this.progressBar.stop();
    }
  }

  private getQueueLength(): number {
    return Number(this.configService.get<number>('REQUEST_QUEUE_LENGTH')) || 10;
  }

  private readonly taskHandler = async (product: Product) => {
    try {
      const requests = this.prepareRequests(product);

      // for (const request of requests) {
      //   const response =
      //     await this.requesterService.get<HttpResponseType>(request);
      //   const productDetail = await this.saveProductDetailTask.run(
      //     product,
      //     request.language,
      //     response,
      //   );
      //
      //   this.logger.log(
      //     `Saved product detail for product ID: ${productDetail.product.id}, Language: ${productDetail.language}`,
      //   );
      // }
      this.progressBar.increment();
      await this.delay();
    } catch (error) {
      this.logger.error('Error in processing product', error.message);
    }
  };

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

  private async delay() {
    await BluebirdPromise.delay(
      Number(this.configService.get<number>('REQUEST_TIMEOUT')),
    );
  }
}
