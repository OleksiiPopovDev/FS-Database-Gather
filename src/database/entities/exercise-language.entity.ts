import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Language {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  short_name: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ required: false })
  full_name_en?: string;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
