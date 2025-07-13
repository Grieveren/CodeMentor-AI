import Anthropic from '@anthropic-ai/sdk';
import logger from '../config/logger.js';

interface RateLimitState {
  requests: number;
  resetTime: number;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface ClaudeResponse {
  content: string;
  usage?: TokenUsage;
}

interface AnalyzeCodeResult {
  issues: Array<{
    line: number;
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  suggestions: string[];
  overall_score: number;
  strengths: string[];
  improvements: string[];
}

interface GenerateHintsResult {
  hint: string;
  confidence: number;
  suggestedApproach: string;
  nextSteps: string[];
}

interface ChatTutorResult {
  response: string;
  confidence: number;
  followUpQuestions: string[];
}

export class ClaudeService {
  private anthropic: Anthropic;
  private rateLimitState: RateLimitState;
  private readonly maxRequestsPerMinute: number = 60;
  private readonly model: string = 'claude-3-haiku-20240307';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });

    this.rateLimitState = {
      requests: 0,
      resetTime: Date.now() + 60000, // Reset every minute
    };
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now >= this.rateLimitState.resetTime) {
      this.rateLimitState.requests = 0;
      this.rateLimitState.resetTime = now + 60000;
    }

    // Check if we've exceeded the limit
    if (this.rateLimitState.requests >= this.maxRequestsPerMinute) {
      logger.warn('Rate limit exceeded for Claude API', {
        requests: this.rateLimitState.requests,
        resetTime: this.rateLimitState.resetTime,
      });
      return false;
    }

    return true;
  }

  /**
   * Make a request to Claude API with streaming support
   */
  private async makeRequest(
    prompt: string,
    systemPrompt?: string,
    maxTokens: number = 1024
  ): Promise<ClaudeResponse> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const startTime = Date.now();
    
    try {
      this.rateLimitState.requests++;
      
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      const usage: TokenUsage = {
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
      };

      const duration = Date.now() - startTime;

      // Log token usage
      logger.info('Claude API request completed', {
        model: this.model,
        duration,
        usage,
        promptLength: prompt.length,
        responseLength: content.text.length,
      });

      return {
        content: content.text,
        usage,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Claude API request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        promptLength: prompt.length,
      });
      throw error;
    }
  }

  /**
   * Stream responses from Claude API
   */
  async *streamRequest(
    prompt: string,
    systemPrompt?: string,
    maxTokens: number = 1024
  ): AsyncGenerator<string, TokenUsage, unknown> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const startTime = Date.now();
    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    
    try {
      this.rateLimitState.requests++;
      
      const stream = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
        
        if (chunk.type === 'message_start') {
          promptTokens = chunk.message.usage.input_tokens;
        }
        
        if (chunk.type === 'message_delta' && chunk.usage) {
          completionTokens = chunk.usage.output_tokens;
        }
      }

      totalTokens = promptTokens + completionTokens;
      const duration = Date.now() - startTime;

      // Log token usage
      logger.info('Claude API streaming request completed', {
        model: this.model,
        duration,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        promptLength: prompt.length,
      });

      return {
        promptTokens,
        completionTokens,
        totalTokens,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Claude API streaming request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        promptLength: prompt.length,
      });
      throw error;
    }
  }

  /**
   * Analyze code for issues, suggestions, and improvements
   */
  async analyzeCode(
    code: string,
    language: string = 'javascript',
    context?: string
  ): Promise<AnalyzeCodeResult> {
    const systemPrompt = `You are an expert code reviewer and mentor. Analyze the provided code and provide detailed feedback focusing on:
1. Code quality issues (bugs, errors, potential problems)
2. Best practices and style suggestions
3. Performance improvements
4. Security considerations
5. Maintainability and readability

Respond with a JSON object containing:
- issues: Array of specific issues with line numbers, type, message, and severity
- suggestions: Array of general improvement suggestions
- overall_score: Score from 0-100
- strengths: Array of positive aspects
- improvements: Array of areas for improvement

Be constructive and educational in your feedback.`;

    const prompt = `Please analyze this ${language} code:

${context ? `Context: ${context}\n\n` : ''}

\`\`\`${language}
${code}
\`\`\`

Provide detailed analysis as JSON.`;

    try {
      const response = await this.makeRequest(prompt, systemPrompt, 1500);
      const analysis = JSON.parse(response.content);
      
      return {
        issues: analysis.issues || [],
        suggestions: analysis.suggestions || [],
        overall_score: analysis.overall_score || 0,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
      };
    } catch (error) {
      logger.error('Code analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        codeLength: code.length,
        language,
      });
      throw new Error('Failed to analyze code');
    }
  }

  /**
   * Generate contextual hints for coding problems
   */
  async generateHints(
    exerciseId: string,
    userCode: string,
    errorMessage?: string,
    difficulty?: string
  ): Promise<GenerateHintsResult> {
    const systemPrompt = `You are a patient and encouraging coding tutor. Generate helpful hints for students working on coding exercises. Your hints should:
1. Be encouraging and supportive
2. Guide students toward the solution without giving it away
3. Focus on the specific problem they're facing
4. Suggest a learning approach or methodology
5. Provide clear next steps

Respond with a JSON object containing:
- hint: Main hint message
- confidence: Confidence level (0-1)
- suggestedApproach: Recommended approach or strategy
- nextSteps: Array of concrete next steps to take`;

    const prompt = `Student needs help with exercise ${exerciseId}${difficulty ? ` (${difficulty} level)` : ''}

Current code:
\`\`\`
${userCode}
\`\`\`

${errorMessage ? `Error message: ${errorMessage}\n\n` : ''}

Please provide an encouraging hint that guides them toward the solution.`;

    try {
      const response = await this.makeRequest(prompt, systemPrompt, 800);
      const hints = JSON.parse(response.content);
      
      return {
        hint: hints.hint || 'Try breaking down the problem into smaller steps.',
        confidence: hints.confidence || 0.7,
        suggestedApproach: hints.suggestedApproach || 'Start by identifying the core requirements.',
        nextSteps: hints.nextSteps || ['Review the problem statement', 'Test your current code'],
      };
    } catch (error) {
      logger.error('Hint generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        exerciseId,
        codeLength: userCode.length,
      });
      throw new Error('Failed to generate hints');
    }
  }

  /**
   * Interactive chat tutor for answering student questions
   */
  async chatTutor(
    question: string,
    context?: {
      topic?: string;
      difficulty?: string;
      previousConversation?: string[];
    }
  ): Promise<ChatTutorResult> {
    const systemPrompt = `You are Claude, an expert programming tutor and mentor. You help students learn programming concepts through:
1. Clear, patient explanations
2. Practical examples and analogies
3. Encouraging students to think through problems
4. Asking follow-up questions to assess understanding
5. Providing additional resources and next steps

Keep responses conversational, educational, and encouraging. If appropriate, ask follow-up questions to help students learn more effectively.`;

    let prompt = `Student question: ${question}`;
    
    if (context?.topic) {
      prompt += `\nTopic: ${context.topic}`;
    }
    
    if (context?.difficulty) {
      prompt += `\nDifficulty level: ${context.difficulty}`;
    }
    
    if (context?.previousConversation && context.previousConversation.length > 0) {
      prompt += `\nPrevious conversation:\n${context.previousConversation.join('\n')}`;
    }

    try {
      const response = await this.makeRequest(prompt, systemPrompt, 1200);
      
      // Extract follow-up questions from the response
      const followUpQuestions = this.extractFollowUpQuestions(response.content);
      
      return {
        response: response.content,
        confidence: 0.9, // High confidence for chat responses
        followUpQuestions,
      };
    } catch (error) {
      logger.error('Chat tutor failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        questionLength: question.length,
        topic: context?.topic,
      });
      throw new Error('Failed to generate tutor response');
    }
  }

  /**
   * Stream chat tutor responses for real-time interaction
   */
  async *streamChatTutor(
    question: string,
    context?: {
      topic?: string;
      difficulty?: string;
      previousConversation?: string[];
    }
  ): AsyncGenerator<string, { followUpQuestions: string[] }, unknown> {
    const systemPrompt = `You are Claude, an expert programming tutor and mentor. You help students learn programming concepts through:
1. Clear, patient explanations
2. Practical examples and analogies
3. Encouraging students to think through problems
4. Asking follow-up questions to assess understanding
5. Providing additional resources and next steps

Keep responses conversational, educational, and encouraging. If appropriate, ask follow-up questions to help students learn more effectively.`;

    let prompt = `Student question: ${question}`;
    
    if (context?.topic) {
      prompt += `\nTopic: ${context.topic}`;
    }
    
    if (context?.difficulty) {
      prompt += `\nDifficulty level: ${context.difficulty}`;
    }
    
    if (context?.previousConversation && context.previousConversation.length > 0) {
      prompt += `\nPrevious conversation:\n${context.previousConversation.join('\n')}`;
    }

    let fullResponse = '';
    
    try {
      const stream = this.streamRequest(prompt, systemPrompt, 1200);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        yield chunk;
      }
      
      // Extract follow-up questions from the complete response
      const followUpQuestions = this.extractFollowUpQuestions(fullResponse);
      
      return { followUpQuestions };
    } catch (error) {
      logger.error('Streaming chat tutor failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        questionLength: question.length,
        topic: context?.topic,
      });
      throw new Error('Failed to generate streaming tutor response');
    }
  }

  /**
   * Extract follow-up questions from response text
   */
  private extractFollowUpQuestions(text: string): string[] {
    const questions: string[] = [];
    
    // Look for lines that end with question marks
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.endsWith('?') && trimmed.length > 10) {
        questions.push(trimmed);
      }
    }
    
    // Limit to 3 most relevant questions
    return questions.slice(0, 3);
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): { requests: number; resetTime: number; maxRequests: number } {
    return {
      requests: this.rateLimitState.requests,
      resetTime: this.rateLimitState.resetTime,
      maxRequests: this.maxRequestsPerMinute,
    };
  }
}

export default ClaudeService;
