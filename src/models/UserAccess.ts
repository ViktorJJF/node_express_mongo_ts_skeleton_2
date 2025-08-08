import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import { IUserAccess } from '../types/entities';

const UserAccessSchema = new Schema(
  {
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: 'EMAIL_IS_NOT_VALID',
      },
      lowercase: true,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  } as any,
  {
    versionKey: false,
    timestamps: true,
  },
);

export default mongoose.model<IUserAccess>('UserAccess', UserAccessSchema);
