import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Muscle } from '../../database/entities/muscle.entity';

@Injectable()
export class MuscleRepository {
  constructor(
    @InjectModel(Muscle.name) private readonly muscleModel: Model<Muscle>,
  ) {}

  public async save(muscle: Partial<Muscle>): Promise<Muscle> {
    return this.muscleModel.findOneAndUpdate({ id: muscle.id }, muscle, {
      upsert: true,
      new: true,
    });
  }
}
