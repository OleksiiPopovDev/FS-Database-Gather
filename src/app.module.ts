import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductDetailParserModule } from './product-detail-parser/product-detail-parser.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProductDetailParserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
