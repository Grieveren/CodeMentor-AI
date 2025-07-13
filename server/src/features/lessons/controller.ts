import { Request, Response } from 'express';
import { catchAsync, CustomError } from '../../middleware/errorHandler.js';
import { LessonsService } from './service.js';
import { validateCreateLesson, validateUpdateLesson } from './validation.js';
import logger from '../../config/logger.js';

export class LessonsController {
  private lessonsService: LessonsService;

  constructor() {
    this.lessonsService = new LessonsService();
  }

  getAllLessons = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, difficulty, category } = req.query;
    
    const lessons = await this.lessonsService.getAllLessons({
      page: Number(page),
      limit: Number(limit),
      difficulty: difficulty as string,
      category: category as string,
    });

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      data: { lessons },
    });
  });

  getLessonById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const lesson = await this.lessonsService.getLessonById(id);
    
    if (!lesson) {
      throw new CustomError('Lesson not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { lesson },
    });
  });

  createLesson = catchAsync(async (req: Request, res: Response) => {
    const { error } = validateCreateLesson(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const lesson = await this.lessonsService.createLesson(req.body);
    
    logger.info(`Lesson created: ${lesson.title}`);

    res.status(201).json({
      status: 'success',
      data: { lesson },
    });
  });

  updateLesson = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = validateUpdateLesson(req.body);
    
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const lesson = await this.lessonsService.updateLesson(id, req.body);
    
    if (!lesson) {
      throw new CustomError('Lesson not found', 404);
    }

    logger.info(`Lesson updated: ${lesson.title}`);

    res.status(200).json({
      status: 'success',
      data: { lesson },
    });
  });

  deleteLesson = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const lesson = await this.lessonsService.deleteLesson(id);
    
    if (!lesson) {
      throw new CustomError('Lesson not found', 404);
    }

    logger.info(`Lesson deleted: ${lesson.title}`);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  getLessonsByCategory = catchAsync(async (req: Request, res: Response) => {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Note: This endpoint expects a track ID, not a category name
    // In a real implementation, you might want to look up the track by slug or name
    const lessons = await this.lessonsService.getLessonsByTrack(category, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      data: { lessons },
    });
  });
}
