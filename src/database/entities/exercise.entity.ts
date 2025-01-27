import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Muscle, MuscleSchema } from './muscle.entity';
import { Equipment, EquipmentSchema } from './exercise-equipment.entity';
import { Category, CategorySchema } from './exercise-category.entity';
import { Language, LanguageSchema } from './exercise-language.entity';
import { Image } from './exercise-image.entity';
import { License } from './exercise-license.entity';
import { Comment } from './exercise-comment.entity';
import { Video } from './exercise-video.entity';
import { Alias } from './exercise-alias.entity';

@Schema()
export class Exercise extends Document {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [Alias], default: [] })
  aliases: Alias[];

  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  exercise_base_id: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  created: string;

  @Prop({ type: CategorySchema, required: true })
  category: Category;

  @Prop({ type: [MuscleSchema], default: [] })
  muscles: Muscle[];

  @Prop({ type: [MuscleSchema], default: [] })
  muscles_secondary: Muscle[];

  @Prop({ type: [EquipmentSchema], default: [] })
  equipment: Equipment[];

  @Prop({ type: LanguageSchema, required: true })
  language: Language;

  @Prop({ type: License, required: true })
  license: License;

  @Prop({ required: false })
  license_author?: string;

  @Prop({ type: [Image], default: [] })
  images: Image[];

  @Prop({ type: [Video], default: [] })
  videos: Video[];

  @Prop({ type: [Comment], default: [] })
  comments: Comment[];

  @Prop({ type: [Number], default: [] })
  variations: number[];

  @Prop({ type: [String], default: [] })
  author_history: string[];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
