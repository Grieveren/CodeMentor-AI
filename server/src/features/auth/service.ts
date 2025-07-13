import { PrismaClient, UserRole } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export class AuthService {
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        passwordHash: true,
        refreshToken: true,
        refreshTokenExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserByRefreshToken(refreshToken: string) {
    return await prisma.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        refreshToken: true,
        refreshTokenExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    username: string;
  }) {
    return await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        name: userData.name,
        passwordHash: userData.password,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: string, userData: Partial<{
    email: string;
    name: string;
    password: string;
  }>) {
    return await prisma.user.update({
      where: { id },
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async storeRefreshToken(userId: string, refreshToken: string, expiresAt: Date) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
        refreshTokenExpiry: expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
      },
    });
  }

  async revokeRefreshToken(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiry: null,
      },
      select: {
        id: true,
      },
    });
  }

  async revokeAllRefreshTokens(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiry: null,
      },
      select: {
        id: true,
      },
    });
  }

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
