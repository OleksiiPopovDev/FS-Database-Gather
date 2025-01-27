import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exercise, ExerciseSchema } from '../database/entities/exercise.entity';
import { Muscle, MuscleSchema } from '../database/entities/muscle.entity';
import {
  Equipment,
  EquipmentSchema,
} from '../database/entities/exercise-equipment.entity';
import {
  Category,
  CategorySchema,
} from '../database/entities/exercise-category.entity';
import {
  Language,
  LanguageSchema,
} from '../database/entities/exercise-language.entity';
import { ExerciseInfoParserCommand } from './exercise-info-parser.command';
import { RestApiModule } from '../rest-api/rest-api.module';
import { ExerciseRepository } from './repositories/exercise.repository';
import { CategoryRepository } from './repositories/category.repository';
import { MuscleRepository } from './repositories/muscle.repository';
import { LanguageRepository } from './repositories/language.repository';
import { EquipmentRepository } from './repositories/equipment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exercise.name, schema: ExerciseSchema },
      { name: Language.name, schema: LanguageSchema },
      { name: Muscle.name, schema: MuscleSchema },
      { name: Equipment.name, schema: EquipmentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Muscle.name, schema: LanguageSchema },
    ]),
    RestApiModule,
  ],
  providers: [
    Logger,
    ExerciseInfoParserCommand,
    ExerciseRepository,
    CategoryRepository,
    MuscleRepository,
    LanguageRepository,
    EquipmentRepository,
  ],
})
export class ExerciseModule {}
