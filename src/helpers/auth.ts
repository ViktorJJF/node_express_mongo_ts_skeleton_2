import crypto from 'crypto';
import { buildErrObject } from '../helpers/utils';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const secret: string = process.env.JWT_SECRET!;
const algorithm: string = 'aes-192-cbc';
// Key length is dependent on the algorithm. In this case for aes192, it is
// 24 bytes (192 bits).
const key: Buffer = crypto.scryptSync(secret, 'salt', 24);
const iv: Buffer = Buffer.alloc(16, 0); // Initialization crypto vector

type User = { comparePassword?: (password: string) => Promise<boolean>; password?: string };

export const checkPassword = async (
  password: string,
  user: User,
): Promise<boolean> => {
  try {
    if (typeof user.comparePassword === 'function') {
      return await user.comparePassword(password);
    }
    if (user.password) {
      return await bcrypt.compare(password, user.password);
    }
    throw new Error('No password available to compare');
  } catch (error: any) {
    throw buildErrObject(422, error.message);
  }
};

export const encrypt = (text: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted: string = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};

export const decrypt = (text: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  try {
    let decrypted: string = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
};

/**
 * Gets user id from token
 * @param {string} token - Encrypted and encoded token
 */
export const getUserIdFromToken = async (token: string): Promise<string> => {
  try {
    // Decrypts, verifies and decode token
    const decoded = (await new Promise((resolve, reject) => {
      jwt.verify(
        decrypt(token),
        process.env.JWT_SECRET || 'default-secret-key',
        (err: any, decoded: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        },
      );
    })) as any;

    return decoded.data._id;
  } catch (err) {
    throw buildErrObject(409, 'BAD_TOKEN');
  }
};
