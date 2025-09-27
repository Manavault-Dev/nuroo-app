/**
 * Data Encryption Service
 * Handles encryption/decryption of sensitive data
 */

import CryptoJS from 'crypto-js';
import Constants from 'expo-constants';

export interface EncryptionConfig {
  key: string;
  algorithm: string;
}

export class EncryptionService {
  private static readonly DEFAULT_ALGORITHM = 'AES';
  private static readonly DEFAULT_KEY_SIZE = 256;
  
  /**
   * Get encryption key from environment or generate a default one
   */
  private static getEncryptionKey(): string {
    const envKey = Constants.expoConfig?.extra?.ENCRYPTION_KEY;
    
    if (envKey) {
      return envKey;
    }
    
    // Fallback to a default key (in production, this should be set in environment)
    console.warn('Using default encryption key. Set ENCRYPTION_KEY in environment for production.');
    return 'nuroo-default-key-2024';
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string): string {
    try {
      const key = this.getEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!result) {
        throw new Error('Invalid encrypted data');
      }
      
      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt child's sensitive information
   */
  static encryptChildData(childData: {
    name?: string;
    age?: string;
    diagnosis?: string;
    developmentAreas?: string[];
  }): {
    name?: string;
    age?: string;
    diagnosis?: string;
    developmentAreas?: string[];
  } {
    const encrypted: any = {};
    
    if (childData.name) {
      encrypted.name = this.encrypt(childData.name);
    }
    
    if (childData.age) {
      encrypted.age = this.encrypt(childData.age);
    }
    
    if (childData.diagnosis) {
      encrypted.diagnosis = this.encrypt(childData.diagnosis);
    }
    
    if (childData.developmentAreas) {
      encrypted.developmentAreas = childData.developmentAreas.map(area => this.encrypt(area));
    }
    
    return encrypted;
  }

  /**
   * Decrypt child's sensitive information
   */
  static decryptChildData(encryptedChildData: {
    name?: string;
    age?: string;
    diagnosis?: string;
    developmentAreas?: string[];
  }): {
    name?: string;
    age?: string;
    diagnosis?: string;
    developmentAreas?: string[];
  } {
    const decrypted: any = {};
    
    if (encryptedChildData.name) {
      decrypted.name = this.decrypt(encryptedChildData.name);
    }
    
    if (encryptedChildData.age) {
      decrypted.age = this.decrypt(encryptedChildData.age);
    }
    
    if (encryptedChildData.diagnosis) {
      decrypted.diagnosis = this.decrypt(encryptedChildData.diagnosis);
    }
    
    if (encryptedChildData.developmentAreas) {
      decrypted.developmentAreas = encryptedChildData.developmentAreas.map(area => this.decrypt(area));
    }
    
    return decrypted;
  }

  /**
   * Encrypt task data
   */
  static encryptTaskData(taskData: {
    title?: string;
    description?: string;
    instructions?: string;
    materials?: string[];
  }): {
    title?: string;
    description?: string;
    instructions?: string;
    materials?: string[];
  } {
    const encrypted: any = {};
    
    if (taskData.title) {
      encrypted.title = this.encrypt(taskData.title);
    }
    
    if (taskData.description) {
      encrypted.description = this.encrypt(taskData.description);
    }
    
    if (taskData.instructions) {
      encrypted.instructions = this.encrypt(taskData.instructions);
    }
    
    if (taskData.materials) {
      encrypted.materials = taskData.materials.map(material => this.encrypt(material));
    }
    
    return encrypted;
  }

  /**
   * Decrypt task data
   */
  static decryptTaskData(encryptedTaskData: {
    title?: string;
    description?: string;
    instructions?: string;
    materials?: string[];
  }): {
    title?: string;
    description?: string;
    instructions?: string;
    materials?: string[];
  } {
    const decrypted: any = {};
    
    if (encryptedTaskData.title) {
      decrypted.title = this.decrypt(encryptedTaskData.title);
    }
    
    if (encryptedTaskData.description) {
      decrypted.description = this.decrypt(encryptedTaskData.description);
    }
    
    if (encryptedTaskData.instructions) {
      decrypted.instructions = this.decrypt(encryptedTaskData.instructions);
    }
    
    if (encryptedTaskData.materials) {
      decrypted.materials = encryptedTaskData.materials.map(material => this.decrypt(material));
    }
    
    return decrypted;
  }

  /**
   * Hash sensitive data for comparison (one-way)
   */
  static hash(data: string): string {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Generate a secure random key
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * Check if data is encrypted (basic check)
   */
  static isEncrypted(data: string): boolean {
    try {
      // Try to decrypt - if it works, it's encrypted
      this.decrypt(data);
      return true;
    } catch {
      return false;
    }
  }
}
