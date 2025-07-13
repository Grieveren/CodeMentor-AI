import dotenv from 'dotenv';
import ClaudeService from './services/claudeService.js';
import logger from './config/logger.js';

// Load environment variables
dotenv.config();

async function testClaudeIntegration() {
  console.log('Testing Claude integration...');
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not found in environment variables');
    console.log('Please set your API key in the .env file');
    return;
  }
  
  try {
    const claudeService = new ClaudeService();
    
    // Test 1: Analyze Code
    console.log('\n1. Testing analyzeCode...');
    const testCode = `
function calculateSum(a, b) {
  var result = a + b;
  return result;
}
`;
    
    const analysis = await claudeService.analyzeCode(testCode, 'javascript');
    console.log('Code analysis result:', JSON.stringify(analysis, null, 2));
    
    // Test 2: Generate Hints
    console.log('\n2. Testing generateHints...');
    const hints = await claudeService.generateHints(
      'test-exercise-1',
      'function add(a, b) { return a + b; }',
      'TypeError: Cannot read property of undefined'
    );
    console.log('Hints result:', JSON.stringify(hints, null, 2));
    
    // Test 3: Chat Tutor
    console.log('\n3. Testing chatTutor...');
    const chatResponse = await claudeService.chatTutor(
      'Can you explain what a for loop is?',
      { topic: 'loops', difficulty: 'beginner' }
    );
    console.log('Chat response:', JSON.stringify(chatResponse, null, 2));
    
    // Test 4: Rate Limit Status
    console.log('\n4. Testing rate limit status...');
    const rateLimitStatus = claudeService.getRateLimitStatus();
    console.log('Rate limit status:', rateLimitStatus);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Claude integration test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Run the test
testClaudeIntegration();
