import { Module } from '@nestjs/common';
import { ProductDetailParserModule } from './product-detail-parser/product-detail-parser.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RestApiModule } from './rest-api/rest-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProductDetailParserModule,
    RestApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
