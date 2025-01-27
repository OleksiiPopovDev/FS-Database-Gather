import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class License {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  short_name: string;

  @Prop({ required: true })
  url: string;
}
