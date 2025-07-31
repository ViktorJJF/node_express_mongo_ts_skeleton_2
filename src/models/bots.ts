import mongoose, { Schema, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Bot as IBot } from '../types/bots';

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

schema.plugin(mongoosePaginate);

const BotModel = mongoose.model<IBot>('Bots', schema) as PaginateModel<IBot>;

export default BotModel;
