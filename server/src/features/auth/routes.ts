import { Router } from 'express';
import passport from 'passport';
import { AuthController } from './controller.js';
import { authenticate, adminOnly, instructorOrAdmin, studentAccess } from './middleware.js';
import { oauthController } from './oauth.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/auth/error' }),
  oauthController.githubCallback
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  oauthController.googleCallback
);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

// Demo routes showing different role access levels
router.get('/admin-only', authenticate, adminOnly, (req, res) => {
  res.json({ message: 'Admin access granted', user: (req as any).user });
});

router.get('/instructor-or-admin', authenticate, instructorOrAdmin, (req, res) => {
  res.json({ message: 'Instructor or Admin access granted', user: (req as any).user });
});

router.get('/student-access', authenticate, studentAccess, (req, res) => {
  res.json({ message: 'Student access granted', user: (req as any).user });
});

export default router;
