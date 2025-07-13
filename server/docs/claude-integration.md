# Claude AI Integration

This document describes the Claude AI integration layer built for CodeMentor AI.

## Overview

The Claude integration provides three main functions:
- `analyzeCode`: Analyzes code for issues, suggestions, and improvements
- `generateHints`: Generates contextual hints for coding problems
- `chatTutor`: Interactive chat tutor for answering student questions

## Features

### Rate Limiting
- Built-in rate limiting (60 requests per minute)
- Automatic token window reset
- Rate limit status endpoint

### Token Usage Logging
- Comprehensive logging of all API calls
- Token usage tracking (input, output, total)
- Performance metrics (request duration)
- Error logging with context

### Streaming Support
- Real-time streaming chat responses
- Server-Sent Events (SSE) for live interactions
- Chunked response delivery

### Error Handling
- Graceful fallbacks for API failures
- Detailed error logging
- User-friendly error messages

## Setup

1. Install dependencies:
```bash
npm install @anthropic-ai/sdk
```

2. Set your API key in `.env`:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

3. Test the integration:
```bash
npm run test:claude
```

## API Endpoints

### POST /api/ai/analyze
Analyzes code using Claude AI.

**Request:**
```json
{
  "code": "function example() { return 'hello'; }",
  "language": "javascript",
  "context": "Optional context about the code"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "analysis": {
      "issues": [
        {
          "line": 1,
          "type": "suggestion",
          "message": "Consider using const for immutable values",
          "severity": "low"
        }
      ],
      "suggestions": ["Use modern ES6 syntax"],
      "overall_score": 85,
      "strengths": ["Good function structure"],
      "improvements": ["Add error handling"]
    }
  }
}
```

### POST /api/ai/hints
Generates contextual hints for coding exercises.

**Request:**
```json
{
  "exerciseId": "exercise-123",
  "userCode": "function solve() { /* incomplete */ }",
  "errorMessage": "SyntaxError: Unexpected token",
  "difficulty": "beginner"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "hints": {
      "hint": "It looks like you're missing a closing bracket. Check your function syntax.",
      "confidence": 0.9,
      "suggestedApproach": "Start by checking your brackets and parentheses",
      "nextSteps": [
        "Review the function structure",
        "Check for matching brackets",
        "Test with a simple example"
      ]
    }
  }
}
```

### POST /api/ai/chat
Interactive chat tutor for student questions.

**Request:**
```json
{
  "question": "What is a for loop?",
  "context": {
    "topic": "loops",
    "difficulty": "beginner",
    "previousConversation": ["Previous messages..."]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "chat": {
      "response": "A for loop is a control structure that repeats code...",
      "confidence": 0.95,
      "followUpQuestions": [
        "Would you like to see an example?",
        "Do you understand the syntax?",
        "Should we try a practice problem?"
      ]
    }
  }
}
```

### POST /api/ai/chat/stream
Streaming chat responses using Server-Sent Events.

**Request:** Same as `/api/ai/chat`

**Response:** Server-Sent Events stream
```
data: {"type": "chunk", "data": "A for loop is"}
data: {"type": "chunk", "data": " a control structure"}
data: {"type": "complete", "data": {"followUpQuestions": ["..."]}}
data: [DONE]
```

### GET /api/ai/rate-limit
Check current rate limit status.

**Response:**
```json
{
  "status": "success",
  "data": {
    "rateLimitStatus": {
      "requests": 15,
      "resetTime": 1642789200000,
      "maxRequests": 60
    }
  }
}
```

## Service Architecture

### ClaudeService
Main service class that wraps the Anthropic SDK:

```typescript
import ClaudeService from './services/claudeService.js';

const claudeService = new ClaudeService();

// Analyze code
const analysis = await claudeService.analyzeCode(code, language, context);

// Generate hints
const hints = await claudeService.generateHints(exerciseId, userCode, errorMessage);

// Chat tutor
const chat = await claudeService.chatTutor(question, context);

// Streaming chat
for await (const chunk of claudeService.streamChatTutor(question, context)) {
  console.log(chunk);
}
```

### Integration with Existing AI Service
The existing `AIService` has been updated to use Claude for:
- `generateHint()` - Now uses Claude's generateHints
- `reviewCode()` - Now uses Claude's analyzeCode

### Error Handling
All methods include comprehensive error handling:
- API failures fall back to basic responses
- Rate limiting prevents API quota exhaustion
- Detailed logging for debugging

## Configuration

### Environment Variables
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `LOG_LEVEL`: Logging level (default: 'info')

### Rate Limiting
- Default: 60 requests per minute
- Configurable in `ClaudeService` constructor
- Automatic reset every minute

### Model Configuration
- Default model: `claude-3-haiku-20240307`
- Configurable in `ClaudeService` constructor
- Support for different models per use case

## Monitoring

### Logging
All API calls are logged with:
- Request duration
- Token usage (input/output/total)
- Error details
- Request metadata

### Rate Limiting
- Current request count
- Reset time
- Request blocking when limits exceeded

### Performance Metrics
- Response times
- Token consumption
- Error rates

## Testing

Run the integration test:
```bash
npm run test:claude
```

The test covers:
1. Code analysis functionality
2. Hint generation
3. Chat tutor responses
4. Rate limit status

## Best Practices

1. **Rate Limiting**: Always check rate limits before making requests
2. **Error Handling**: Implement fallbacks for API failures
3. **Token Management**: Monitor token usage to control costs
4. **Streaming**: Use streaming for real-time user interactions
5. **Logging**: Log all API calls for debugging and monitoring

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure `ANTHROPIC_API_KEY` is set correctly
2. **Rate Limiting**: Check rate limit status and implement backoff
3. **Network Issues**: Implement retry logic for transient failures
4. **Large Responses**: Handle token limits and response truncation

### Debug Mode
Set `LOG_LEVEL=debug` to see detailed API call information.
