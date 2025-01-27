import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Equipment } from '../../database/entities/exercise-equipment.entity';

@Injectable()
export class EquipmentRepository {
  constructor(
    @InjectModel(Equipment.name)
    private readonly languageModel: Model<Equipment>,
  ) {}

  public async save(equipment: Partial<Equipment>): Promise<Equipment> {
    return this.languageModel.findOneAndUpdate(
      { id: equipment.id },
      equipment,
      {
        upsert: true,
        new: true,
      },
    );
  }
}
