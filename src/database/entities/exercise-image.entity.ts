import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Image {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  exercise_base: number;

  @Prop({ required: true })
  exercise_base_uuid: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  is_main: boolean;

  @Prop({ required: true })
  style: string;

  @Prop({ required: true })
  license: number;

  @Prop({ required: false })
  license_author?: string;
}
