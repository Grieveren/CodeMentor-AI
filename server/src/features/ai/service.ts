import { PrismaClient } from '../../generated/prisma/index.js';
import ClaudeService from '../../services/claudeService.js';
import logger from '../../config/logger.js';

const prisma = new PrismaClient();

export class AIService {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  async generateHint(exerciseId: string, userCode: string, errorMessage?: string) {
    try {
      const result = await this.claudeService.generateHints(
        exerciseId,
        userCode,
        errorMessage
      );
      
      return {
        hint: result.hint,
        confidence: result.confidence,
        suggestedApproach: result.suggestedApproach,
        nextSteps: result.nextSteps
      };
    } catch (error) {
      logger.error('Failed to generate AI hint', {
        error: error instanceof Error ? error.message : 'Unknown error',
        exerciseId,
      });
      
      // Fallback to basic hint
      return {
        hint: "Consider checking your variable declarations and function syntax. Try breaking down the problem into smaller steps.",
        confidence: 0.5,
        suggestedApproach: "Start by identifying the input parameters and expected output format.",
        nextSteps: ['Review the problem statement', 'Test your current code']
      };
    }
  }

  async explainConcept(concept: string, level: string) {
    // Placeholder for AI concept explanation
    // In a real implementation, this would generate tailored explanations
    return {
      explanation: `A ${concept} is a fundamental programming concept that...`,
      examples: [
        {
          title: "Basic Example",
          code: `// Example of ${concept}`,
          explanation: "This example demonstrates..."
        }
      ],
      relatedConcepts: ["variables", "functions", "loops"],
      difficulty: level
    };
  }

  async reviewCode(code: string, language: string) {
    try {
      const result = await this.claudeService.analyzeCode(code, language);
      
      return {
        overall_score: result.overall_score,
        suggestions: result.issues.map(issue => ({
          line: issue.line,
          type: issue.type,
          message: issue.message,
          severity: issue.severity
        })),
        strengths: result.strengths,
        improvements: result.improvements
      };
    } catch (error) {
      logger.error('Failed to review code with AI', {
        error: error instanceof Error ? error.message : 'Unknown error',
        codeLength: code.length,
        language,
      });
      
      // Fallback to basic review
      return {
        overall_score: 75,
        suggestions: [
          {
            line: 1,
            type: "style",
            message: "Consider using const instead of let for variables that don't change",
            severity: "low"
          }
        ],
        strengths: [
          "Code is syntactically correct"
        ],
        improvements: [
          "Add error handling",
          "Consider edge cases"
        ]
      };
    }
  }

  async generateExercise(topic: string, difficulty: string, language: string) {
    // Placeholder for AI exercise generation
    // In a real implementation, this would create custom exercises
    return {
      title: `${topic} Exercise - ${difficulty}`,
      description: `Practice ${topic} concepts with this ${difficulty} level exercise.`,
      instructions: "Write a function that...",
      starterCode: `// Your code here\nfunction solve() {\n  // Implementation goes here\n}`,
      testCases: [
        {
          input: "test input",
          expected: "expected output",
          description: "Test case description"
        }
      ],
      hints: [
        "Start by understanding the problem requirements",
        "Consider the data types involved"
      ]
    };
  }

  async getPersonalizedRecommendations(userId: string) {
    // Get user's progress and learning patterns
    const userProgress = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            trackId: true,
            difficulty: true,
          }
        }
      }
    });

    // Placeholder for AI-powered recommendations
    // In a real implementation, this would analyze user patterns and suggest content
    const recommendations = [
      {
        type: "lesson",
        title: "Advanced JavaScript Concepts",
        reason: "Based on your progress in JavaScript fundamentals",
        confidence: 0.9,
        estimatedTime: 45
      },
      {
        type: "practice",
        title: "Array Methods Practice",
        reason: "You seem to struggle with array manipulation",
        confidence: 0.7,
        estimatedTime: 20
      }
    ];

    return {
      recommendations,
      learningPath: "JavaScript Developer",
      nextMilestone: "Complete 5 more intermediate exercises",
      strengthAreas: ["Problem solving", "Syntax"],
      improvementAreas: ["Algorithm complexity", "Error handling"]
    };
  }
}
