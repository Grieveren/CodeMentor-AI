import { Request, Response } from 'express';
import { catchAsync, CustomError } from '../../middleware/errorHandler.js';
import { AIService } from './service.js';
import ClaudeService from '../../services/claudeService.js';
import logger from '../../config/logger.js';

export class AIController {
  private aiService: AIService;
  private claudeService: ClaudeService;

  constructor() {
    this.aiService = new AIService();
    this.claudeService = new ClaudeService();
  }

  generateHint = catchAsync(async (req: Request, res: Response) => {
    const { exerciseId, userCode, errorMessage } = req.body;

    if (!exerciseId || !userCode) {
      throw new CustomError('Exercise ID and user code are required', 400);
    }

    const hint = await this.aiService.generateHint(exerciseId, userCode, errorMessage);

    res.status(200).json({
      status: 'success',
      data: { hint },
    });
  });

  explainConcept = catchAsync(async (req: Request, res: Response) => {
    const { concept, level = 'beginner' } = req.body;

    if (!concept) {
      throw new CustomError('Concept is required', 400);
    }

    const explanation = await this.aiService.explainConcept(concept, level);

    res.status(200).json({
      status: 'success',
      data: { explanation },
    });
  });

  reviewCode = catchAsync(async (req: Request, res: Response) => {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      throw new CustomError('Code is required', 400);
    }

    const review = await this.aiService.reviewCode(code, language);

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  });

  generateExercise = catchAsync(async (req: Request, res: Response) => {
    const { topic, difficulty = 'beginner', language = 'javascript' } = req.body;

    if (!topic) {
      throw new CustomError('Topic is required', 400);
    }

    const exercise = await this.aiService.generateExercise(topic, difficulty, language);

    res.status(200).json({
      status: 'success',
      data: { exercise },
    });
  });

  getPersonalizedRecommendations = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const recommendations = await this.aiService.getPersonalizedRecommendations(userId);

    res.status(200).json({
      status: 'success',
      data: { recommendations },
    });
  });

  // New Claude integration methods
  analyzeCode = catchAsync(async (req: Request, res: Response) => {
    const { code, language = 'javascript', context } = req.body;

    if (!code) {
      throw new CustomError('Code is required', 400);
    }

    const analysis = await this.claudeService.analyzeCode(code, language, context);
    res.status(200).json({
      status: 'success',
      data: { analysis },
    });
  });

  generateHints = catchAsync(async (req: Request, res: Response) => {
    const { exerciseId, userCode, errorMessage, difficulty } = req.body;

    if (!exerciseId || !userCode) {
      throw new CustomError('Exercise ID and user code are required', 400);
    }

    const hints = await this.claudeService.generateHints(exerciseId, userCode, errorMessage, difficulty);
    res.status(200).json({
      status: 'success',
      data: { hints },
    });
  });

  chatTutor = catchAsync(async (req: Request, res: Response) => {
    const { question, context } = req.body;

    if (!question) {
      throw new CustomError('Question is required', 400);
    }

    const chat = await this.claudeService.chatTutor(question, context);
    res.status(200).json({
      status: 'success',
      data: { chat },
    });
  });

  // Rate limit status endpoint
  getRateLimitStatus = catchAsync(async (req: Request, res: Response) => {
    const rateLimitStatus = this.claudeService.getRateLimitStatus();
    res.status(200).json({
      status: 'success',
      data: { rateLimitStatus },
    });
  });

  // Streaming chat endpoint
  streamChatTutor = catchAsync(async (req: Request, res: Response) => {
    const { question, context } = req.body;

    if (!question) {
      throw new CustomError('Question is required', 400);
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    try {
      const stream = this.claudeService.streamChatTutor(question, context);
      
      for await (const chunk of stream) {
        if (typeof chunk === 'string') {
          // Stream the text chunk
          res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
        } else {
          // Stream the final result with follow-up questions
          res.write(`data: ${JSON.stringify({ type: 'complete', data: chunk })}\n\n`);
        }
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      logger.error('Streaming chat failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        question: question.substring(0, 100),
      });
      
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed to generate response' })}\n\n`);
      res.end();
    }
  });
}
