import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from './service.js';
import { jwtService } from './jwt.js';
import { UserRole } from '../../generated/prisma/index.js';
import logger from '../../config/logger.js';

const authService = new AuthService();

/**
 * OAuth Configuration
 */
export class OAuthConfig {
  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // GitHub OAuth Strategy
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',
        scope: ['user:email']
      }, this.githubVerify));
    }

    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
        scope: ['profile', 'email']
      }, this.googleVerify));
    }

    // Passport session setup
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await authService.findUserById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  /**
   * GitHub OAuth verification callback
   */
  private githubVerify = async (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void
  ) => {
    try {
      const email = profile.emails?.[0]?.value;
      const username = profile.username;
      const name = profile.displayName || profile.username;
      const avatar = profile.photos?.[0]?.value;
      const githubUrl = profile.profileUrl;

      if (!email) {
        return done(new Error('No email found in GitHub profile'), null);
      }

      // Check if user exists
let user = await authService.findUserByEmail(email);

if (!user) {
  // Create new user
  user = await authService.createUser({
    email,
    name,
    username: username || email.split('@')[0],
    password: '', // No password for OAuth users
  }) as any;

        // TODO: Update user profile with GitHub info
        // This would require adding fields to updateUser method
        logger.info(`New user created via GitHub OAuth: ${email}`);
      } else {
        logger.info(`Existing user logged in via GitHub OAuth: ${email}`);
      }

      return done(null, user);
    } catch (error) {
      logger.error('GitHub OAuth verification error:', error);
      return done(error, null);
    }
  };

  /**
   * Google OAuth verification callback
   */
  private googleVerify = async (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void
  ) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      const avatar = profile.photos?.[0]?.value;
      const googleId = profile.id;

      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user exists
let user = await authService.findUserByEmail(email);

if (!user) {
  // Create new user
  user = await authService.createUser({
    email,
    name,
    username: email.split('@')[0],
    password: '', // No password for OAuth users
  }) as any;

        // TODO: Update user profile with Google info
        // This would require adding fields to updateUser method
        logger.info(`New user created via Google OAuth: ${email}`);
      } else {
        logger.info(`Existing user logged in via Google OAuth: ${email}`);
      }

      return done(null, user);
    } catch (error) {
      logger.error('Google OAuth verification error:', error);
      return done(error, null);
    }
  };
}

/**
 * OAuth Controller for handling OAuth callbacks
 */
export class OAuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * GitHub OAuth callback handler
   */
  githubCallback = async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/auth/error?error=oauth_failed`);
      }

      // Generate JWT tokens
      const tokens = jwtService.generateTokenPair(user.id, user.email, user.role);

      // Store refresh token
      const refreshTokenHash = jwtService.generateRefreshTokenHash();
      const refreshTokenExpiry = jwtService.getRefreshTokenExpiry();
      await this.authService.storeRefreshToken(user.id, refreshTokenHash, refreshTokenExpiry);

      // Redirect to client with tokens
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?` +
        `access_token=${tokens.accessToken}&` +
        `refresh_token=${tokens.refreshToken}&` +
        `expires_in=${tokens.expiresIn}`;

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error?error=oauth_callback_failed`);
    }
  };

  /**
   * Google OAuth callback handler
   */
  googleCallback = async (req: any, res: any) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/auth/error?error=oauth_failed`);
      }

      // Generate JWT tokens
      const tokens = jwtService.generateTokenPair(user.id, user.email, user.role);

      // Store refresh token
      const refreshTokenHash = jwtService.generateRefreshTokenHash();
      const refreshTokenExpiry = jwtService.getRefreshTokenExpiry();
      await this.authService.storeRefreshToken(user.id, refreshTokenHash, refreshTokenExpiry);

      // Redirect to client with tokens
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?` +
        `access_token=${tokens.accessToken}&` +
        `refresh_token=${tokens.refreshToken}&` +
        `expires_in=${tokens.expiresIn}`;

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error?error=oauth_callback_failed`);
    }
  };
}

// Export configuration instance
export const oauthConfig = new OAuthConfig();
export const oauthController = new OAuthController();
