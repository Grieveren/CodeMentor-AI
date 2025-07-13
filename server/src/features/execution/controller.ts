import { Request, Response } from 'express';
import { catchAsync, CustomError } from '../../middleware/errorHandler.js';
import { ExecutionService } from './service.js';
import logger from '../../config/logger.js';

export class ExecutionController {
  private executionService: ExecutionService;

  constructor() {
    this.executionService = new ExecutionService();
  }

  executeCode = catchAsync(async (req: Request, res: Response) => {
    const { code, language = 'javascript', input = '' } = req.body;
    const userId = (req as any).user.id;

    if (!code) {
      throw new CustomError('Code is required', 400);
    }

    const result = await this.executionService.executeCode(code, language, input, userId);

    res.status(200).json({
      status: 'success',
      data: { result },
    });
  });

  testCode = catchAsync(async (req: Request, res: Response) => {
    const { code, language = 'javascript', testCases } = req.body;
    const userId = (req as any).user.id;

    if (!code || !testCases) {
      throw new CustomError('Code and test cases are required', 400);
    }

    const results = await this.executionService.testCode(code, language, testCases, userId);

    res.status(200).json({
      status: 'success',
      data: { results },
    });
  });

  validateSolution = catchAsync(async (req: Request, res: Response) => {
    const { code, exerciseId, language = 'javascript' } = req.body;
    const userId = (req as any).user.id;

    if (!code || !exerciseId) {
      throw new CustomError('Code and exercise ID are required', 400);
    }

    const validation = await this.executionService.validateSolution(code, exerciseId, language, userId);

    res.status(200).json({
      status: 'success',
      data: { validation },
    });
  });

  getExecutionHistory = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { limit = 10, offset = 0 } = req.query;

    const history = await this.executionService.getExecutionHistory(userId, {
      limit: Number(limit),
      offset: Number(offset),
    });

    res.status(200).json({
      status: 'success',
      data: { history },
    });
  });
}
