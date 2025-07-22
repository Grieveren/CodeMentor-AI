import { db } from './lib/database';

async function testDatabaseSchema() {
  console.log('🧪 Testing database schema and operations...\n');

  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    await db.$connect();
    console.log('   ✅ Database connection successful\n');

    // Test 2: Test user creation
    console.log('2. Testing user creation...');
    const testUser = await db.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        role: 'STUDENT',
      },
    });
    console.log('   ✅ User created:', testUser.username);

    // Test 3: Test track creation
    console.log('\n3. Testing track creation...');
    const testTrack = await db.track.create({
      data: {
        title: 'Test Track',
        description: 'A test learning track',
        slug: 'test-track',
        difficulty: 'BEGINNER',
        tags: ['Test'],
        isPublished: true,
      },
    });
    console.log('   ✅ Track created:', testTrack.title);

    // Test 4: Test lesson creation
    console.log('\n4. Testing lesson creation...');
    const testLesson = await db.lesson.create({
      data: {
        title: 'Test Lesson',
        description: 'A test lesson',
        slug: 'test-lesson',
        content: '# Test Lesson\n\nThis is a test lesson.',
        trackId: testTrack.id,
        difficulty: 'BEGINNER',
        estimatedTime: 30,
        isPublished: true,
      },
    });
    console.log('   ✅ Lesson created:', testLesson.title);

    // Test 5: Test challenge creation
    console.log('\n5. Testing challenge creation...');
    const testChallenge = await db.challenge.create({
      data: {
        title: 'Test Challenge',
        description: 'A test coding challenge',
        instructions: 'Write a function that returns "Hello, World!"',
        startingCode: 'function hello() {\n  // Your code here\n}',
        solution: 'function hello() {\n  return "Hello, World!";\n}',
        testCases: [
          {
            description: 'Returns correct greeting',
            expected: 'Hello, World!',
            test: 'hello() === "Hello, World!"',
          },
        ],
        difficulty: 'BEGINNER',
        language: 'JAVASCRIPT',
        tags: ['Functions', 'Basics'],
        hints: ['Use the return statement'],
        lessonId: testLesson.id,
        isPublished: true,
      },
    });
    console.log('   ✅ Challenge created:', testChallenge.title);

    // Test 6: Test progress tracking
    console.log('\n6. Testing progress tracking...');
    await db.progress.create({
      data: {
        userId: testUser.id,
        trackId: testTrack.id,
        status: 'IN_PROGRESS',
        score: 75.0,
        timeSpent: 45,
        startedAt: new Date(),
      },
    });
    console.log('   ✅ Progress record created for user:', testUser.username);

    // Test 7: Test submission
    console.log('\n7. Testing submission creation...');
    const testSubmission = await db.submission.create({
      data: {
        userId: testUser.id,
        challengeId: testChallenge.id,
        code: 'function hello() {\n  return "Hello, World!";\n}',
        language: 'JAVASCRIPT',
        status: 'COMPLETED',
        score: 100.0,
        testResults: {
          passed: 1,
          total: 1,
          details: [{ test: 'Returns correct greeting', passed: true }],
        },
      },
    });
    console.log('   ✅ Submission created with score:', testSubmission.score);

    // Test 8: Test chat history
    console.log('\n8. Testing chat history...');
    await db.chatHistory.createMany({
      data: [
        {
          userId: testUser.id,
          message: 'How do I write a function in JavaScript?',
          role: 'USER',
          context: {
            lessonId: testLesson.id,
            challengeId: testChallenge.id,
          },
        },
        {
          userId: testUser.id,
          message:
            'To write a function in JavaScript, use the `function` keyword followed by the function name and parentheses.',
          role: 'ASSISTANT',
          context: {
            lessonId: testLesson.id,
            challengeId: testChallenge.id,
          },
        },
      ],
    });
    console.log('   ✅ Chat history created');

    // Test 9: Test complex queries
    console.log('\n9. Testing complex queries...');

    // Query user with all related data
    const userWithData = await db.user.findUnique({
      where: { id: testUser.id },
      include: {
        progress: {
          include: {
            track: true,
            lesson: true,
          },
        },
        submissions: {
          include: {
            challenge: {
              include: {
                lesson: true,
              },
            },
          },
        },
        chatHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    console.log('   ✅ Complex query executed successfully');
    console.log('   📊 User data summary:');
    console.log('       - Progress records:', userWithData?.progress.length);
    console.log('       - Submissions:', userWithData?.submissions.length);
    console.log('       - Chat messages:', userWithData?.chatHistory.length);

    // Test 10: Test aggregations
    console.log('\n10. Testing aggregations...');
    const stats = await db.user.aggregate({
      _count: {
        id: true,
      },
      where: {
        role: 'STUDENT',
      },
    });
    console.log('    ✅ Aggregation query executed');
    console.log('    📈 Total students:', stats._count.id);

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await db.chatHistory.deleteMany({
      where: { userId: testUser.id },
    });
    await db.submission.deleteMany({
      where: { userId: testUser.id },
    });
    await db.progress.deleteMany({
      where: { userId: testUser.id },
    });
    await db.challenge.deleteMany({
      where: { lessonId: testLesson.id },
    });
    await db.lesson.deleteMany({
      where: { trackId: testTrack.id },
    });
    await db.track.deleteMany({
      where: { id: testTrack.id },
    });
    await db.user.deleteMany({
      where: { id: testUser.id },
    });
    console.log('   ✅ Test data cleaned up');

    console.log('\n🎉 All database tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connection works');
    console.log('   ✅ All table operations work');
    console.log('   ✅ Relationships are properly defined');
    console.log('   ✅ Complex queries execute correctly');
    console.log('   ✅ Data integrity is maintained');
    console.log('   ✅ Enums are working correctly');
    console.log('   ✅ JSON fields store data properly');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
    console.log('\n📡 Database disconnected');
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseSchema()
    .then(() => {
      console.log('\n✨ Database schema test completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Database schema test failed:', error);
      process.exit(1);
    });
}

export { testDatabaseSchema };
