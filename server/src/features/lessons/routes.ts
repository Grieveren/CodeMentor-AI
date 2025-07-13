import { Router } from 'express';
import { LessonsController } from './controller.js';
import { authenticate, authorize } from '../auth/middleware.js';

const router = Router();
const lessonsController = new LessonsController();

// Public routes
router.get('/', lessonsController.getAllLessons);
router.get('/:id', lessonsController.getLessonById);
router.get('/category/:category', lessonsController.getLessonsByCategory);

// Protected routes (admin only)
router.use(authenticate);
router.use(authorize('ADMIN', 'INSTRUCTOR'));

router.post('/', lessonsController.createLesson);
router.put('/:id', lessonsController.updateLesson);
router.delete('/:id', lessonsController.deleteLesson);

export default router;
