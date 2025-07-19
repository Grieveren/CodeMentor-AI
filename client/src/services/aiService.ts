import { apiClient } from './apiClient';
import type {
  CodeReview,
  Hint,
  ChatMessage,
  ProgrammingLanguage,
} from '@/types';

export interface CodeReviewRequest {
  code: string;
  language: ProgrammingLanguage;
  context?: {
    lessonId?: string;
    challengeId?: string;
    description?: string;
  };
}

export interface HintRequest {
  challengeId?: string;
  lessonId?: string;
  userCode?: string;
  language?: ProgrammingLanguage;
  difficulty?: number; // 1-5, where 1 requests the most helpful hint
}

export interface ChatRequest {
  message: string;
  context?: {
    lessonId?: string;
    challengeId?: string;
    code?: string;
    language?: ProgrammingLanguage;
  };
  conversationId?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
}

export interface ExplanationRequest {
  concept: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  context?: {
    lessonId?: string;
    language?: ProgrammingLanguage;
  };
}

export interface CodeExplanationRequest {
  code: string;
  language: ProgrammingLanguage;
  focusAreas?: ('syntax' | 'logic' | 'performance' | 'best-practices')[];
}

export class AIService {
  /**
   * Request AI code review
   */
  async reviewCode(request: CodeReviewRequest): Promise<CodeReview> {
    const response = await apiClient.post<CodeReview>('/api/ai/review', request);
    return response.data;
  }

  /**
   * Get AI-generated hint for a challenge or lesson
   */
  async getHint(request: HintRequest): Promise<Hint> {
    const response = await apiClient.post<Hint>('/api/ai/hint', request);
    return response.data;
  }

  /**
   * Send message to AI chat
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/ai/chat', request);
    return response.data;
  }

  /**
   * Get streaming chat response
   * Returns a ReadableStream for real-time message streaming
   */
  async sendChatMessageStream(request: ChatRequest): Promise<ReadableStream<Uint8Array>> {
    const axiosInstance = apiClient.getInstance();
    
    const response = await axiosInstance.post('/api/ai/chat/stream', request, {
      responseType: 'stream',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    // Convert axios stream to ReadableStream
    const reader = response.data;
    return new ReadableStream({
      start(controller) {
        reader.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        reader.on('end', () => {
          controller.close();
        });

        reader.on('error', (error: Error) => {
          controller.error(error);
        });
      },
    });
  }

  /**
   * Get conversation history
   */
  async getChatHistory(conversationId: string, limit?: number): Promise<ChatMessage[]> {
    const queryParams = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<ChatMessage[]>(
      `/api/ai/chat/${conversationId}/history${queryParams}`
    );
    return response.data;
  }

  /**
   * Clear conversation history
   */
  async clearChatHistory(conversationId: string): Promise<void> {
    await apiClient.delete(`/api/ai/chat/${conversationId}/history`);
  }

  /**
   * Get explanation for a programming concept
   */
  async explainConcept(request: ExplanationRequest): Promise<string> {
    const response = await apiClient.post<{ explanation: string }>('/api/ai/explain', request);
    return response.data.explanation;
  }

  /**
   * Get code explanation
   */
  async explainCode(request: CodeExplanationRequest): Promise<string> {
    const response = await apiClient.post<{ explanation: string }>('/api/ai/explain-code', request);
    return response.data.explanation;
  }

  /**
   * Generate code examples for a concept
   */
  async generateCodeExamples(
    concept: string,
    language: ProgrammingLanguage,
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<{ examples: Array<{ title: string; code: string; explanation: string }> }> {
    const response = await apiClient.post<{
      examples: Array<{ title: string; code: string; explanation: string }>;
    }>('/api/ai/examples', {
      concept,
      language,
      difficulty,
    });
    return response.data;
  }

  /**
   * Get code suggestions for improvement
   */
  async getSuggestions(
    code: string,
    language: ProgrammingLanguage,
    focusArea?: 'performance' | 'readability' | 'security' | 'best-practices'
  ): Promise<{ suggestions: string[] }> {
    const response = await apiClient.post<{ suggestions: string[] }>('/api/ai/suggestions', {
      code,
      language,
      focusArea,
    });
    return response.data;
  }

  /**
   * Generate practice problems
   */
  async generatePracticeProblems(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    language: ProgrammingLanguage,
    count: number = 3
  ): Promise<{
    problems: Array<{
      title: string;
      description: string;
      starterCode: string;
      hints: string[];
    }>;
  }> {
    const response = await apiClient.post<{
      problems: Array<{
        title: string;
        description: string;
        starterCode: string;
        hints: string[];
      }>;
    }>('/api/ai/practice-problems', {
      topic,
      difficulty,
      language,
      count,
    });
    return response.data;
  }

  /**
   * Analyze code complexity
   */
  async analyzeComplexity(
    code: string,
    language: ProgrammingLanguage
  ): Promise<{
    timeComplexity: string;
    spaceComplexity: string;
    analysis: string;
    suggestions: string[];
  }> {
    const response = await apiClient.post<{
      timeComplexity: string;
      spaceComplexity: string;
      analysis: string;
      suggestions: string[];
    }>('/api/ai/analyze-complexity', {
      code,
      language,
    });
    return response.data;
  }

  /**
   * Debug code and find potential issues
   */
  async debugCode(
    code: string,
    language: ProgrammingLanguage,
    error?: string
  ): Promise<{
    issues: Array<{
      line: number;
      type: 'error' | 'warning' | 'suggestion';
      message: string;
      fix: string;
    }>;
    explanation: string;
  }> {
    const response = await apiClient.post<{
      issues: Array<{
        line: number;
        type: 'error' | 'warning' | 'suggestion';
        message: string;
        fix: string;
      }>;
      explanation: string;
    }>('/api/ai/debug', {
      code,
      language,
      error,
    });
    return response.data;
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;