import { InputSanitizer, InputValidator } from '@/lib/utils/sanitization';

describe('InputSanitizer', () => {
  describe('sanitizeText', () => {
    it('should trim whitespace by default', () => {
      const result = InputSanitizer.sanitizeText('  hello world  ');
      expect(result).toBe('hello world');
    });

    it('should remove HTML tags when allowHtml is false', () => {
      const result = InputSanitizer.sanitizeText(
        '<script>alert("xss")</script>hello',
      );
      expect(result).toBe('hello');
    });

    it('should limit text length', () => {
      const longText = 'a'.repeat(2000);
      const result = InputSanitizer.sanitizeText(longText, { maxLength: 100 });
      expect(result).toHaveLength(100);
    });

    it('should remove special characters when allowSpecialChars is false', () => {
      const result = InputSanitizer.sanitizeText('hello<>world', {
        allowSpecialChars: false,
      });
      expect(result).toBe('helloworld');
    });
  });

  describe('sanitizeEmail', () => {
    it('should convert to lowercase and trim', () => {
      const result = InputSanitizer.sanitizeEmail('  TEST@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });

    it('should remove invalid characters', () => {
      const result = InputSanitizer.sanitizeEmail('test@example.com<script>');
      expect(result).toBe('test@example.com');
    });

    it('should limit length to 254 characters', () => {
      const longEmail = 'a'.repeat(300) + '@example.com';
      const result = InputSanitizer.sanitizeEmail(longEmail);
      expect(result).toHaveLength(254);
    });
  });

  describe('sanitizeName', () => {
    it('should allow letters and spaces', () => {
      const result = InputSanitizer.sanitizeName('John Doe');
      expect(result).toBe('John Doe');
    });

    it('should remove numbers and special characters', () => {
      const result = InputSanitizer.sanitizeName('John123!@#Doe');
      expect(result).toBe('JohnDoe');
    });

    it('should limit length to 50 characters', () => {
      const longName = 'a'.repeat(100);
      const result = InputSanitizer.sanitizeName(longName);
      expect(result).toHaveLength(50);
    });
  });

  describe('sanitizeAge', () => {
    it('should return valid age', () => {
      const result = InputSanitizer.sanitizeAge(5);
      expect(result).toBe(5);
    });

    it('should throw error for invalid age', () => {
      expect(() => InputSanitizer.sanitizeAge(25)).toThrow('Invalid age');
      expect(() => InputSanitizer.sanitizeAge(-1)).toThrow('Invalid age');
    });
  });

  describe('containsMaliciousContent', () => {
    it('should detect script tags', () => {
      const result = InputSanitizer.containsMaliciousContent(
        '<script>alert("xss")</script>',
      );
      expect(result).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      const result = InputSanitizer.containsMaliciousContent(
        'javascript:alert("xss")',
      );
      expect(result).toBe(true);
    });

    it('should return false for safe content', () => {
      const result = InputSanitizer.containsMaliciousContent('Hello world');
      expect(result).toBe(false);
    });
  });
});

describe('InputValidator', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(InputValidator.isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(InputValidator.isValidEmail('invalid-email')).toBe(false);
      expect(InputValidator.isValidEmail('test@')).toBe(false);
      expect(InputValidator.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should validate correct name', () => {
      expect(InputValidator.isValidName('John Doe')).toBe(true);
    });

    it('should reject invalid name', () => {
      expect(InputValidator.isValidName('')).toBe(false);
      expect(InputValidator.isValidName('John123')).toBe(false);
      expect(InputValidator.isValidName('a'.repeat(100))).toBe(false);
    });
  });

  describe('isValidAge', () => {
    it('should validate correct age', () => {
      expect(InputValidator.isValidAge(5)).toBe(true);
      expect(InputValidator.isValidAge(0)).toBe(true);
      expect(InputValidator.isValidAge(18)).toBe(true);
    });

    it('should reject invalid age', () => {
      expect(InputValidator.isValidAge(19)).toBe(false);
      expect(InputValidator.isValidAge(-1)).toBe(false);
      expect(InputValidator.isValidAge(5.5)).toBe(false);
    });
  });
});
