import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Alias {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  alias: string;
}
