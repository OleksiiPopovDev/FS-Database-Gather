import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.entity';
import { ProductDetail } from '../database/entities/product-detail.entity';
import { ProductDetailParserCommand } from './product-detail-parser.command';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductDetail]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [Logger, ProductDetailParserCommand],
})
export class ProductDetailParserModule {}
