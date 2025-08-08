import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import logger from '../config/logger';
import { buildErrObject } from './utils';

const SALT_FACTOR = 5;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw buildErrObject(500, 'PASSWORD_HASHING_FAILED');
  }
};

/**
 * Compare a password with its hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export const checkPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    throw buildErrObject(500, 'PASSWORD_COMPARISON_FAILED');
  }
};

/**
 * Compare password with user object (for compatibility)
 * @param password - Plain text password
 * @param user - User object with password field
 * @returns Boolean indicating if passwords match
 */
export const checkPasswordWithUser = async (
  password: string,
  user: any,
): Promise<boolean> => {
  return await checkPassword(password, user.password);
};

/**
 * Generates a token
 * @param user - User object
 */
export const generateToken = (user: any): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: parseInt(process.env.JWT_EXPIRATION_IN_MINUTES || '60') * 60,
  });
};

/**
 * Gets user id from token
 * @param token - JWT token
 */
export const getUserIdFromToken = async (token: string): Promise<string> => {
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    let decoded: any;
    try {
      // Try decrypting wrapper token first (encrypted flow)
      const inner = decrypt(token);
      decoded = jwt.verify(inner, secret) as any;
    } catch (_e) {
      // Fallback: verify token directly (plain JWT flow)
      decoded = jwt.verify(token, secret) as any;
    }

    const id = decoded?.id ?? decoded?.data?._id;
    if (!id) {
      throw buildErrObject(401, 'INVALID_TOKEN');
    }
    return String(id);
  } catch (error) {
    logger.error('Error decoding token:', error);
    throw buildErrObject(401, 'INVALID_TOKEN');
  }
};

/**
 * Encrypts text using JWT (for backward compatibility)
 * @param text - Text to encrypt
 */
export const encrypt = (text: string): string => {
  return jwt.sign({ text }, process.env.JWT_SECRET || 'secret');
};

/**
 * Decrypts text using JWT (for backward compatibility)
 * @param encryptedText - Encrypted text
 */
export const decrypt = (encryptedText: string): string => {
  try {
    const decoded = jwt.verify(
      encryptedText,
      process.env.JWT_SECRET || 'secret',
    ) as any;
    return decoded.text;
  } catch (error) {
    logger.error('Error decrypting text:', error);
    throw buildErrObject(400, 'DECRYPTION_FAILED');
  }
};

/**
 * Gets request IP
 * @param req - Express request object
 */
export const getIP = (req: Request): string => {
  return req.clientIp || req.connection.remoteAddress || req.ip || '';
};

/**
 * Gets browser information from user agent
 * @param req - Express request object
 */
export const getBrowserInfo = (req: Request): string => {
  return req.headers['user-agent'] || '';
};

/**
 * Gets country information (placeholder - implement with a geo-IP service)
 * @param req - Express request object
 */
export const getCountry = (req: Request): string => {
  // Placeholder - implement with a geo-IP service like maxmind or similar
  return (req.headers['cf-ipcountry'] as string) || 'Unknown';
};

// Re-export checkPassword as the default export for backward compatibility
export { checkPassword as default };

// Keep the old function names for backward compatibility
export const checkPasswordAgainstHash = checkPassword;
export { checkPasswordWithUser as checkPasswordUser };
