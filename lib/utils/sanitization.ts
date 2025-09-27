/**
 * Input sanitization utilities for security
 */

export interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  allowSpecialChars?: boolean;
  trimWhitespace?: boolean;
}

export class InputSanitizer {
  /**
   * Sanitize text input by removing potentially dangerous content
   */
  static sanitizeText(input: string, options: SanitizationOptions = {}): string {
    const {
      maxLength = 1000,
      allowHtml = false,
      allowSpecialChars = true,
      trimWhitespace = true,
    } = options;

    let sanitized = input;

    // Trim whitespace if requested
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Remove HTML tags if not allowed
    if (!allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove potentially dangerous characters
    if (!allowSpecialChars) {
      sanitized = sanitized.replace(/[<>\"'%;()&+]/g, '');
    }

    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    return email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@._-]/g, '')
      .substring(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitize name input (for child names, user names)
   */
  static sanitizeName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Z\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F]/g, '') // Allow letters, spaces, and extended Latin
      .substring(0, 50);
  }

  /**
   * Sanitize age input
   */
  static sanitizeAge(age: string | number): number {
    const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
    
    if (isNaN(numAge) || numAge < 0 || numAge > 18) {
      throw new Error('Invalid age: must be between 0 and 18');
    }
    
    return numAge;
  }

  /**
   * Sanitize diagnosis/medical information
   */
  static sanitizeMedicalInfo(info: string): string {
    return info
      .trim()
      .replace(/[<>\"'%;()&+]/g, '')
      .substring(0, 500);
  }

  /**
   * Validate and sanitize OpenAI prompt
   */
  static sanitizePrompt(prompt: string): string {
    return prompt
      .trim()
      .replace(/[<>\"'%;()&+]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 4000); // OpenAI token limit consideration
  }

  /**
   * Check if input contains potentially malicious content
   */
  static containsMaliciousContent(input: string): boolean {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /onclick/i,
      /eval\(/i,
      /expression\(/i,
      /url\(/i,
    ];

    return maliciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(input: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
  }
}

/**
 * Validation utilities
 */
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate name format
   */
  static isValidName(name: string): boolean {
    return name.length >= 1 && name.length <= 50 && /^[a-zA-Z\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F]+$/.test(name);
  }

  /**
   * Validate age
   */
  static isValidAge(age: number): boolean {
    return Number.isInteger(age) && age >= 0 && age <= 18;
  }

  /**
   * Validate diagnosis
   */
  static isValidDiagnosis(diagnosis: string): boolean {
    return diagnosis.length >= 1 && diagnosis.length <= 500;
  }
}
