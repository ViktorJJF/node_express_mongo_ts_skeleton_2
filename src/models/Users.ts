import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import mongoosePaginate from 'mongoose-paginate-v2';
import logger from '../config/logger';
import { IUser } from '../types/entities/users';

const UserSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: String,
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: 'EMAIL_IS_NOT_VALID',
      },
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin', 'developer', 'agent', 'owner'],
      default: 'user',
    },
    verification: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    urlTwitter: {
      type: String,
      validate: {
        validator(v: string) {
          return v === '' ? true : validator.isURL(v);
        },
        message: 'NOT_A_VALID_URL',
      },
      lowercase: true,
    },
    urlGitHub: {
      type: String,
      validate: {
        validator(v: string) {
          return v === '' ? true : validator.isURL(v);
        },
        message: 'NOT_A_VALID_URL',
      },
      lowercase: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    blockExpires: {
      type: Date,
      default: Date.now,
      select: false,
    },
  } as any,
  {
    versionKey: false,
    timestamps: true,
  },
);

UserSchema.pre('save', async function () {
  const SALT_FACTOR = 5;
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw error;
  }
});

UserSchema.methods.comparePassword = async function (
  passwordAttempt: string,
): Promise<boolean> {
  return await bcrypt.compare(passwordAttempt, this.password);
};

UserSchema.plugin(mongoosePaginate);

export default mongoose.model('Users', UserSchema);
