import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product } from './entities/product.entity';
import { ProductDetail } from './entities/product-detail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('MYSQL_HOST'),
        port: config.get<number>('MYSQL_PORT'),
        username: config.get<string>('MYSQL_USER'),
        password: config.get<string>('MYSQL_PASS'),
        database: config.get<string>('DB_NAME'),
        entities: [Product, ProductDetail],
        synchronize: false,
        logging: false,
        retryAttempts: 0,
        retryDelay: 0,
      }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        ignoreUndefined: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
