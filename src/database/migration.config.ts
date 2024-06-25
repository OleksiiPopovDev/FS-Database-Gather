import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductDetail } from './entities/product-detail.entity';
import { Product } from './entities/product.entity';

ConfigModule.forRoot();

const configService = new ConfigService();
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: configService.get<string>('MYSQL_HOST'),
  port: configService.get<number>('MYSQL_PORT'),
  username: configService.get<string>('MYSQL_USER'),
  password: configService.get<string>('MYSQL_PASS'),
  database: configService.get<string>('DB_NAME'),
  entities: [Product, ProductDetail],
  migrations: [__dirname + '/../*/migration/*{.ts,.js}'],
  synchronize: false,
});

AppDataSource.initialize()
  .then(() => console.log('Data Source has been initialized!'))
  .catch((err) =>
    console.error('Error during Data Source initialization:', err),
  );
