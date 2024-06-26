import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../database/entities/product.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export class GetProductListTask {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  public async *run() {
    let page = 0;
    const take = this.getQueueLength();

    while (true) {
      const products = await this.productRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.details', 'pd')
        .where(
          '(p.energy IS NOT NULL OR p.protein IS NOT NULL OR p.fat IS NOT NULL OR p.carbohydrates IS NOT NULL)',
        )
        .andWhere('pd.id IS NULL')
        .skip(page * take)
        .take(take)
        .getMany();

      if (products.length === 0) {
        break;
      }

      yield products;
      page++;
    }
  }

  public async count(): Promise<number> {
    return await this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.details', 'pd')
      .where(
        '(p.energy IS NOT NULL OR p.protein IS NOT NULL OR p.fat IS NOT NULL OR p.carbohydrates IS NOT NULL)',
      )
      .andWhere('pd.id IS NULL')
      .getCount();
  }

  private getQueueLength(): number {
    return Number(this.configService.get<number>('REQUEST_QUEUE_LENGTH')) || 10;
  }
}
