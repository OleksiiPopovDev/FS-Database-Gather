import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Equipment {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);
