import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import logger from './logger.js';

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw error;
  }
};

export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw error;
  }
};

export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateAPIKey = (prefix = 'mc_') => {
  const randomPart = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomPart}`;
};

export const hashAPIKey = (apiKey) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

export const verifyAPIKey = (apiKey, hash) => {
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  return keyHash === hash;
};

export const encrypt = (data, encryptionKey) => {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(encryptionKey).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      iv: iv.toString('hex'),
      encrypted,
    };
  } catch (error) {
    logger.error('Error encrypting data:', error);
    throw error;
  }
};

export const decrypt = (encryptedData, encryptionKey) => {
  try {
    const key = crypto.createHash('sha256').update(encryptionKey).digest();
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    logger.error('Error decrypting data:', error);
    throw error;
  }
};

export default {
  hashPassword,
  comparePassword,
  generateSecureToken,
  generateAPIKey,
  hashAPIKey,
  verifyAPIKey,
  encrypt,
  decrypt,
};
