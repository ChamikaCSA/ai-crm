import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly key: Buffer;

  constructor() {
    // Get encryption key from environment variable
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // Derive a key from the encryption key using PBKDF2
    this.key = crypto.pbkdf2Sync(
      encryptionKey,
      'salt', // Using a fixed salt since we're deriving from an already secure key
      100000, // Number of iterations
      this.keyLength,
      'sha256'
    );
  }

  encrypt(text: string): string {
    // Generate a random IV
    const iv = crypto.randomBytes(this.ivLength);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    // Encrypt the text
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);

    // Get the auth tag
    const tag = cipher.getAuthTag();

    // Combine IV, encrypted data, and auth tag
    const result = Buffer.concat([iv, encrypted, tag]);

    // Return as base64 string
    return result.toString('base64');
  }

  decrypt(encryptedText: string): string {
    // Convert from base64
    const buffer = Buffer.from(encryptedText, 'base64');

    // Extract IV, encrypted data, and auth tag
    const iv = buffer.subarray(0, this.ivLength);
    const tag = buffer.subarray(buffer.length - this.tagLength);
    const encrypted = buffer.subarray(this.ivLength, buffer.length - this.tagLength);

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    // Return as string
    return decrypted.toString('utf8');
  }
}