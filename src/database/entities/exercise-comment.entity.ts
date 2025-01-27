import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Comment extends Document {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  exercise: number;

  @Prop({ required: true })
  comment: string;
}
