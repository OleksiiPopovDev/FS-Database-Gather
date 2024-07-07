import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../database/entities/product.entity';
import { Repository } from 'typeorm';

export class GetProductListTask {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  private readonly baseQuery = this.productRepository
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.details', 'pd')
    .where(
      '(p.energy IS NOT NULL OR p.protein IS NOT NULL OR p.fat IS NOT NULL OR p.carbohydrates IS NOT NULL)',
    )
    .andWhere('pd.id IS NULL');

  public async run(offset: number, take: number): Promise<Product[]> {
    return await this.baseQuery.skip(offset).take(take).getMany();
  }

  public async count(): Promise<number> {
    return await this.baseQuery.getCount();
  }

  public async countProcesses(): Promise<number> {
    return await this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.details', 'pd')
      .where(
        '(p.energy IS NOT NULL OR p.protein IS NOT NULL OR p.fat IS NOT NULL OR p.carbohydrates IS NOT NULL)',
      )
      .andWhere('pd.id IS NOT NULL')
      .getCount();
  }
}
