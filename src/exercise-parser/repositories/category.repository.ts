import { Injectable } from '@nestjs/common';
import { Category } from '../../database/entities/exercise-category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  public async save(category: Partial<Category>): Promise<Category> {
    return this.categoryModel.findOneAndUpdate({ id: category.id }, category, {
      upsert: true,
      new: true,
    });
  }
}
