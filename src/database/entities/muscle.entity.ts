import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Muscle {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  name_en?: string;

  @Prop({ required: true })
  is_front: boolean;

  @Prop({ required: true })
  image_url_main: string;

  @Prop({ required: false })
  image_url_secondary?: string;
}

export const MuscleSchema = SchemaFactory.createForClass(Muscle);
