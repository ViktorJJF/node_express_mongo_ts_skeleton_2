import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const BrandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    website: {
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

BrandSchema.plugin(mongoosePaginate);

export default mongoose.model('Brands', BrandSchema);
