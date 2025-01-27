import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.entity';
import { ProductDetail } from '../database/entities/product-detail.entity';
import { ProductDetailParserCommand } from './product-detail-parser.command';
import { ConfigModule } from '@nestjs/config';
import { GetProductListTask } from './tasks/get-product-list.task';
import { RestApiModule } from '../rest-api/rest-api.module';
import { SaveProductDetailTask } from './tasks/save-product-detail.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductDetail]),
    RestApiModule,
    ConfigModule,
  ],
  providers: [
    Logger,
    ProductDetailParserCommand,
    GetProductListTask,
    SaveProductDetailTask,
  ],
})
export class ProductModule {}
