import { db } from './lib/database';

async function checkData() {
  console.log('🔍 Checking seeded data...\n');
  
  const users = await db.user.count();
  const tracks = await db.track.count();
  const lessons = await db.lesson.count();
  const challenges = await db.challenge.count();
  const submissions = await db.submission.count();
  const progress = await db.progress.count();
  const chatHistory = await db.chatHistory.count();
  
  console.log('📊 Database Contents:');
  console.log(`   👥 Users: ${users}`);
  console.log(`   📚 Tracks: ${tracks}`);
  console.log(`   📖 Lessons: ${lessons}`);
  console.log(`   🎯 Challenges: ${challenges}`);
  console.log(`   💻 Submissions: ${submissions}`);
  console.log(`   📊 Progress records: ${progress}`);
  console.log(`   💬 Chat messages: ${chatHistory}`);
  
  // Show a sample of the data
  console.log('\n📋 Sample Data:');
  const sampleUsers = await db.user.findMany({ take: 2 });
  console.log('   Sample users:');
  sampleUsers.forEach(user => {
    console.log(`     - ${user.name} (${user.username}) - ${user.role}`);
  });
  
  const sampleTracks = await db.track.findMany({ take: 3 });
  console.log('   Sample tracks:');
  sampleTracks.forEach(track => {
    console.log(`     - ${track.title} (${track.difficulty})`);
  });
  
  await db.$disconnect();
}

checkData().catch(console.error);
