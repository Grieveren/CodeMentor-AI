import { Router } from 'express';
import { AIController } from './controller.js';
import { authenticate } from '../auth/middleware.js';

const router = Router();
const aiController = new AIController();

router.use(authenticate);

router.post('/hint', aiController.generateHint);
router.post('/explain', aiController.explainConcept);
router.post('/review', aiController.reviewCode);
router.post('/exercise', aiController.generateExercise);
router.get('/recommendations', aiController.getPersonalizedRecommendations);

// New Claude integration endpoints
router.post('/analyze', aiController.analyzeCode);
router.post('/hints', aiController.generateHints);
router.post('/chat', aiController.chatTutor);
router.post('/chat/stream', aiController.streamChatTutor);
router.get('/rate-limit', aiController.getRateLimitStatus);

export default router;
