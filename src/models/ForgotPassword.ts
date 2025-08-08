import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import { IForgotPassword } from '../types/entities';

const ForgotPasswordSchema = new Schema(
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
    verification: {
      type: String,
    },
    used: {
      type: Boolean,
      default: false,
    },
    ipRequest: {
      type: String,
    },
    browserRequest: {
      type: String,
    },
    countryRequest: {
      type: String,
    },
    ipChanged: {
      type: String,
    },
    browserChanged: {
      type: String,
    },
    countryChanged: {
      type: String,
    },
  } as any,
  {
    versionKey: false,
    timestamps: true,
  },
);

export default mongoose.model<IForgotPassword>(
  'ForgotPassword',
  ForgotPasswordSchema,
);
