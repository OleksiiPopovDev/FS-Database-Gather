import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise } from '../../database/entities/exercise.entity';
import { CategoryRepository } from './category.repository';
import { MuscleRepository } from './muscle.repository';
import { LanguageRepository } from './language.repository';
import { EquipmentRepository } from './equipment.repository';

@Injectable()
export class ExerciseRepository {
  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<Exercise>,
    private readonly categoryRepository: CategoryRepository,
    private readonly muscleRepository: MuscleRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly equipmentRepository: EquipmentRepository,
  ) {}

  public async save(exercise: Partial<Exercise>): Promise<Exercise> {
    const category = await this.categoryRepository.save(exercise.category);

    const muscles = await Promise.all(
      exercise.muscles.map((muscle) => this.muscleRepository.save(muscle)),
    );

    const musclesSecondary = await Promise.all(
      exercise.muscles_secondary.map((muscle) =>
        this.muscleRepository.save(muscle),
      ),
    );

    const equipment = await Promise.all(
      exercise.equipment.map((equipment) =>
        this.equipmentRepository.save(equipment),
      ),
    );

    const language = await this.languageRepository.save(exercise.language);

    const exerciseData = {
      ...exercise,
      category,
      muscles,
      muscles_secondary: musclesSecondary,
      equipment,
      language,
    };

    return this.exerciseModel.findOneAndUpdate(
      { id: exercise.id, uuid: exercise.uuid },
      exerciseData,
      {
        upsert: true,
        new: true,
      },
    );
  }
}
