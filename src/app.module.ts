import { Module } from '@nestjs/common';
import { ProductModule } from './product-detail-parser/product.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { RestApiModule } from './rest-api/rest-api.module';
import { ExerciseModule } from './exercise-parser/exercise.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProductModule,
    ExerciseModule,
    RestApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
