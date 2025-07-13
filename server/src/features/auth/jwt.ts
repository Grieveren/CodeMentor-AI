import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '../../generated/prisma/index.js';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  /**
   * Generate access and refresh token pair
   */
  generateTokenPair(userId: string, email: string, role: UserRole): TokenPair {
    const accessTokenPayload: JWTPayload = {
      userId,
      email,
      role,
      type: 'access'
    };

    const refreshTokenPayload: JWTPayload = {
      userId,
      email,
      role,
      type: 'refresh'
    };

    const accessToken = jwt.sign(accessTokenPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'codementor-ai',
      audience: 'codementor-ai-users'
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(refreshTokenPayload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'codementor-ai',
      audience: 'codementor-ai-users'
    } as jwt.SignOptions);

    // Calculate expiry time in seconds
    const expiresIn = this.getExpiryTime(this.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'codementor-ai',
        audience: 'codementor-ai-users'
      }) as JWTPayload;

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'codementor-ai',
        audience: 'codementor-ai-users'
      }) as JWTPayload;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate a secure random refresh token hash
   */
  generateRefreshTokenHash(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calculate refresh token expiry date
   */
  getRefreshTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days from now
    return expiry;
  }

  /**
   * Convert expiry string to seconds
   */
  private getExpiryTime(expiry: string): number {
    const match = expiry.match(/(\d+)([smhd])/);
    if (!match) return 900; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900;
    }
  }
}

// Export singleton instance
export const jwtService = new JWTService();
