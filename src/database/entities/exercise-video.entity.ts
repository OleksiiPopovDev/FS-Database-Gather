import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Video extends Document {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  exercise_base: number;

  @Prop({ required: true })
  exercise_base_uuid: string;

  @Prop({ required: true })
  video: string;

  @Prop({ required: true, default: false })
  is_main: boolean;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  codec: string;

  @Prop({ required: true })
  codec_long: string;

  @Prop({ required: true })
  license: number;

  @Prop({ required: false })
  license_title?: string;

  @Prop({ required: false })
  license_object_url?: string;

  @Prop({ required: false })
  license_author?: string;

  @Prop({ required: false })
  license_author_url?: string;

  @Prop({ required: false })
  license_derivative_source_url?: string;

  @Prop({ type: [String], default: [] })
  author_history: string[];
}
