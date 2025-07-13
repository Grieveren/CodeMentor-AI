import { Router } from 'express';
import { ProgressController } from './controller.js';
import { authenticate } from '../auth/middleware.js';

const router = Router();
const progressController = new ProgressController();

// All progress routes require authentication
router.use(authenticate);

router.get('/', progressController.getUserProgress);
router.put('/lesson/:lessonId', progressController.updateLessonProgress);
router.get('/stats', progressController.getProgressStats);

export default router;
