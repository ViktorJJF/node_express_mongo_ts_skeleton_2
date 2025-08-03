import crypto from 'crypto';
import { buildErrObject } from '../helpers/utils';
import jwt from 'jsonwebtoken';

const secret: string = process.env.JWT_SECRET!;
const algorithm: string = 'aes-192-cbc';
// Key length is dependent on the algorithm. In this case for aes192, it is
// 24 bytes (192 bits).
const key: Buffer = crypto.scryptSync(secret, 'salt', 24);
const iv: Buffer = Buffer.alloc(16, 0); // Initialization crypto vector

interface User {
  comparePassword(
    password: string,
    callback: (err: any, isMatch: boolean) => void,
  ): void;
}

export const checkPassword = async (
  password: string,
  user: User,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        reject(buildErrObject(422, err.message));
      }
      if (!isMatch) {
        resolve(false);
      }
      resolve(true);
    });
  });
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
export const getUserIdFromToken = (token: string): Promise<string> =>
  new Promise((resolve, reject) => {
    // Decrypts, verifies and decode token
    jwt.verify(
      decrypt(token),
      process.env.JWT_SECRET || 'default-secret-key',
      (err, decoded: any) => {
        if (err) {
          reject(buildErrObject(409, 'BAD_TOKEN'));
        }
        resolve(decoded.data._id);
      },
    );
  });
