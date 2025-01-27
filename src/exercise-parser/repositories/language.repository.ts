import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language } from '../../database/entities/exercise-language.entity';

@Injectable()
export class LanguageRepository {
  constructor(
    @InjectModel(Language.name) private readonly languageModel: Model<Language>,
  ) {}

  public async save(language: Partial<Language>): Promise<Language> {
    return this.languageModel.findOneAndUpdate({ id: language.id }, language, {
      upsert: true,
      new: true,
    });
  }
}
