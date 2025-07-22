import { Request, Response } from 'express';
import { catchAsync } from '../../middleware/errorHandler.js';
import { ProgressService } from './service.js';

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  getUserProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const progress = await this.progressService.getUserProgress(userId);

    res.status(200).json({
      status: 'success',
      data: { progress },
    });
  });

  updateLessonProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { lessonId } = req.params;
    const { completed, score, timeSpent } = req.body;

    const progress = await this.progressService.updateLessonProgress(
      userId,
      lessonId,
      { completed, score, timeSpent }
    );

    res.status(200).json({
      status: 'success',
      data: { progress },
    });
  });

  getProgressStats = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const stats = await this.progressService.getProgressStats(userId);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  });
}
