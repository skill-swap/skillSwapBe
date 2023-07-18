import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsersDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop()
  userName: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop()
  password: string;

  @Prop({ default: Date.now() })
  created: Date;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
