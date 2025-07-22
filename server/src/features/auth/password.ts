import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import logger from '../../config/logger.js';

export class PasswordService {
  private readonly saltRounds: number;

  constructor() {
    // Use 12 rounds by default, configurable via environment
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  }

  /**
   * Hash a password using bcrypt with configurable salt rounds
   */
  async hashPassword(password: string): Promise<string> {
    try {
      // Validate password strength first
      this.validatePasswordStrength(password);

      const salt = await bcrypt.genSalt(this.saltRounds);
      const hash = await bcrypt.hash(password, salt);

      logger.info(
        `Password hashed successfully with ${this.saltRounds} salt rounds`
      );
      return hash;
    } catch (error) {
      logger.error('Password hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify a password against its hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      logger.info(
        `Password verification: ${isValid ? 'successful' : 'failed'}`
      );
      return isValid;
    } catch (error) {
      logger.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Check if password needs rehashing (e.g., if salt rounds changed)
   */
  needsRehash(hash: string): boolean {
    try {
      const rounds = bcrypt.getRounds(hash);
      return rounds < this.saltRounds;
    } catch (error) {
      logger.error('Error checking hash rounds:', error);
      return true; // Assume rehash needed if we can't determine
    }
  }

  /**
   * Generate a secure random password for password reset
   */
  generateSecurePassword(length: number = 16): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(crypto.randomInt(0, charset.length));
    }

    return password;
  }

  /**
   * Generate a secure reset token
   */
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password',
      'password123',
      '12345678',
      'qwerty',
      'abc123',
      'letmein',
      'welcome',
      'admin',
      'user',
      'guest',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      throw new Error(
        'Password is too common. Please choose a stronger password'
      );
    }
  }

  /**
   * Get password strength score (0-100)
   */
  getPasswordStrength(password: string): number {
    let score = 0;

    // Length bonus
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/\d/.test(password)) score += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns

    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
export const passwordService = new PasswordService();
