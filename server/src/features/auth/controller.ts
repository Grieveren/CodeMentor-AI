import { Request, Response } from 'express';
import { catchAsync, CustomError } from '../../middleware/errorHandler.js';
import { AuthService } from './service.js';
import { validateRegister, validateLogin } from './validation.js';
import { jwtService } from './jwt.js';
import { passwordService } from './password.js';
import logger from '../../config/logger.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = catchAsync(async (req: Request, res: Response) => {
    const { error } = validateRegister(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { email, password, name, username } = req.body;

    // Check if user already exists
    const existingUser = await this.authService.findUserByEmail(email);
    if (existingUser) {
      throw new CustomError('User already exists with this email', 409);
    }

    // Hash password with enhanced security
    const hashedPassword = await passwordService.hashPassword(password);

    // Create user
    const user = await this.authService.createUser({
      email,
      password: hashedPassword,
      name,
      username: username || email.split('@')[0],
    });

    // Generate JWT token pair
    const tokens = jwtService.generateTokenPair(user.id, user.email, 'STUDENT');

    // Store refresh token in database
    const refreshTokenHash = jwtService.generateRefreshTokenHash();
    const refreshTokenExpiry = jwtService.getRefreshTokenExpiry();
    await this.authService.storeRefreshToken(user.id, refreshTokenHash, refreshTokenExpiry);

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { error } = validateLogin(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await this.authService.findUserByEmail(email);
    if (!user) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Check password with enhanced security
    const isPasswordValid = await passwordService.verifyPassword(password, user.passwordHash || '');
    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Check if password needs rehashing
    if (passwordService.needsRehash(user.passwordHash || '')) {
      const newHashedPassword = await passwordService.hashPassword(password);
      await this.authService.updateUser(user.id, { password: newHashedPassword });
      logger.info(`Password rehashed for user: ${email}`);
    }

    // Generate JWT token pair
    const tokens = jwtService.generateTokenPair(user.id, user.email, user.role);

    // Store refresh token in database
    const refreshTokenHash = jwtService.generateRefreshTokenHash();
    const refreshTokenExpiry = jwtService.getRefreshTokenExpiry();
    await this.authService.storeRefreshToken(user.id, refreshTokenHash, refreshTokenExpiry);

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    });
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      },
    });
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new CustomError('Refresh token is required', 400);
    }

    // Verify refresh token
    const payload = jwtService.verifyRefreshToken(refreshToken);

    // Find user by refresh token
    const user = await this.authService.findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new CustomError('Invalid refresh token', 401);
    }

    // Generate new token pair
    const tokens = jwtService.generateTokenPair(user.id, user.email, user.role);

    // Store new refresh token
    const newRefreshTokenHash = jwtService.generateRefreshTokenHash();
    const refreshTokenExpiry = jwtService.getRefreshTokenExpiry();
    await this.authService.storeRefreshToken(user.id, newRefreshTokenHash, refreshTokenExpiry);

    logger.info(`Token refreshed for user: ${user.email}`);

    res.status(200).json({
      status: 'success',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    });
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;

    // Revoke refresh token
    await this.authService.revokeRefreshToken(user.id);

    logger.info(`User logged out successfully: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  });

  logoutAll = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;

    // Revoke all refresh tokens
    await this.authService.revokeAllRefreshTokens(user.id);

    logger.info(`User logged out from all devices: ${user.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Logged out from all devices successfully',
    });
  });
}
