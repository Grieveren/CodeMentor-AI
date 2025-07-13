import { Router } from 'express';
import { ExecutionController } from './controller.js';
import { authenticate } from '../auth/middleware.js';

const router = Router();
const executionController = new ExecutionController();

// All execution routes require authentication
router.use(authenticate);

router.post('/execute', executionController.executeCode);
router.post('/test', executionController.testCode);
router.post('/validate', executionController.validateSolution);
router.get('/history', executionController.getExecutionHistory);

export default router;
