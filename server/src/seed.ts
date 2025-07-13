import { db } from './lib/database';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await db.submission.deleteMany({});
  await db.challenge.deleteMany({});
  await db.progress.deleteMany({});
  await db.chatHistory.deleteMany({});
  await db.lesson.deleteMany({});
  await db.track.deleteMany({});
  await db.user.deleteMany({});
  
  console.log('🧹 Cleared existing data');

  // Create sample users
  const studentUser = await db.user.create({
    data: {
      email: 'student@example.com',
      username: 'student1',
      name: 'John Doe',
      role: 'STUDENT',
      bio: 'Aspiring web developer',
      githubUrl: 'https://github.com/johndoe',
    },
  });

  const instructorUser = await db.user.create({
    data: {
      email: 'instructor@example.com',
      username: 'instructor1',
      name: 'Jane Smith',
      role: 'INSTRUCTOR',
      bio: 'Senior Software Engineer with 10+ years experience',
      githubUrl: 'https://github.com/janesmith',
    },
  });

  console.log('👥 Created sample users');

  // Create sample tracks
  const webDevelopmentTrack = await db.track.create({
    data: {
      title: 'Web Development Fundamentals',
      description: 'Master the fundamentals of web development with HTML, CSS, and JavaScript.',
      slug: 'web-development-fundamentals',
      difficulty: 'BEGINNER',
      tags: ['HTML', 'CSS', 'JavaScript', 'Web Development'],
      isPublished: true,
      order: 1,
    },
  });

  const reactTrack = await db.track.create({
    data: {
      title: 'React Development',
      description: 'Learn to build dynamic user interfaces with React.',
      slug: 'react-development',
      difficulty: 'INTERMEDIATE',
      tags: ['React', 'JavaScript', 'Frontend'],
      isPublished: true,
      order: 2,
    },
  });

  const pythonTrack = await db.track.create({
    data: {
      title: 'Python Programming',
      description: 'Learn Python programming from basics to advanced topics.',
      slug: 'python-programming',
      difficulty: 'BEGINNER',
      tags: ['Python', 'Programming', 'Backend'],
      isPublished: true,
      order: 3,
    },
  });

  console.log('📚 Created sample tracks');

  // Create sample lessons for Web Development track
  const htmlLesson = await db.lesson.create({
    data: {
      title: 'Introduction to HTML',
      description: 'Learn the building blocks of web pages with HTML.',
      slug: 'introduction-to-html',
      content: `# Introduction to HTML

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## What is HTML?

HTML describes the structure of a web page using markup. HTML elements are the building blocks of HTML pages.

## Basic Structure

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>
\`\`\`

## Common HTML Elements

- \`<h1>\` to \`<h6>\`: Headings
- \`<p>\`: Paragraphs
- \`<a>\`: Links
- \`<img>\`: Images
- \`<div>\`: Division/Container
- \`<span>\`: Inline container`,
      trackId: webDevelopmentTrack.id,
      difficulty: 'BEGINNER',
      estimatedTime: 45,
      order: 1,
      isPublished: true,
    },
  });

  const cssLesson = await db.lesson.create({
    data: {
      title: 'CSS Styling Basics',
      description: 'Learn to style your web pages with CSS.',
      slug: 'css-styling-basics',
      content: `# CSS Styling Basics

CSS (Cascading Style Sheets) is used to style and layout web pages.

## What is CSS?

CSS describes how HTML elements should be displayed on screen, in print, or in other media.

## CSS Syntax

\`\`\`css
selector {
    property: value;
}
\`\`\`

## Common CSS Properties

- \`color\`: Text color
- \`background-color\`: Background color
- \`font-size\`: Font size
- \`margin\`: Outer spacing
- \`padding\`: Inner spacing
- \`border\`: Border styling`,
      trackId: webDevelopmentTrack.id,
      difficulty: 'BEGINNER',
      estimatedTime: 60,
      order: 2,
      isPublished: true,
    },
  });

  const jsLesson = await db.lesson.create({
    data: {
      title: 'JavaScript Fundamentals',
      description: 'Learn the basics of JavaScript programming.',
      slug: 'javascript-fundamentals',
      content: `# JavaScript Fundamentals

JavaScript is a programming language that enables interactive web pages.

## Variables

\`\`\`javascript
let message = "Hello, World!";
const pi = 3.14159;
var oldStyle = "avoid var";
\`\`\`

## Functions

\`\`\`javascript
function greet(name) {
    return "Hello, " + name + "!";
}

const add = (a, b) => a + b;
\`\`\`

## Control Flow

\`\`\`javascript
if (condition) {
    // code
} else {
    // other code
}

for (let i = 0; i < 10; i++) {
    console.log(i);
}
\`\`\``,
      trackId: webDevelopmentTrack.id,
      difficulty: 'BEGINNER',
      estimatedTime: 90,
      order: 3,
      isPublished: true,
    },
  });

  // Create sample lesson for React track
  const reactLesson = await db.lesson.create({
    data: {
      title: 'React Components',
      description: 'Learn to build reusable React components.',
      slug: 'react-components',
      content: `# React Components

Components are the building blocks of React applications.

## Functional Components

\`\`\`jsx
function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

## JSX

JSX allows you to write HTML-like syntax in JavaScript.

## Props

Props are how you pass data to components.

\`\`\`jsx
<Welcome name="Alice" />
\`\`\``,
      trackId: reactTrack.id,
      difficulty: 'INTERMEDIATE',
      estimatedTime: 75,
      order: 1,
      isPublished: true,
    },
  });

  // Create sample lesson for Python track
  const pythonLesson = await db.lesson.create({
    data: {
      title: 'Python Basics',
      description: 'Learn Python syntax and basic concepts.',
      slug: 'python-basics',
      content: `# Python Basics

Python is a high-level, interpreted programming language.

## Variables and Data Types

\`\`\`python
name = "Alice"
age = 25
height = 5.6
is_student = True
\`\`\`

## Functions

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

## Control Flow

\`\`\`python
if age >= 18:
    print("Adult")
else:
    print("Minor")

for i in range(5):
    print(i)
\`\`\``,
      trackId: pythonTrack.id,
      difficulty: 'BEGINNER',
      estimatedTime: 60,
      order: 1,
      isPublished: true,
    },
  });

  console.log('📖 Created sample lessons');

  // Create sample challenges
  const htmlChallenge = await db.challenge.create({
    data: {
      title: 'Create Your First HTML Page',
      description: 'Build a simple HTML page with proper structure.',
      instructions: `Create an HTML page with the following requirements:

1. Use proper HTML5 doctype
2. Include a title in the head section
3. Add a main heading (h1)
4. Add a paragraph of text
5. Include a link to another website
6. Add an image with alt text`,
      startingCode: `<!DOCTYPE html>
<html>
<head>
    <!-- Add your title here -->
</head>
<body>
    <!-- Add your content here -->
</body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
<head>
    <title>My First Web Page</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>This is my first HTML page. I'm learning web development!</p>
    <a href="https://www.example.com">Visit Example.com</a>
    <img src="image.jpg" alt="A beautiful landscape">
</body>
</html>`,
      testCases: [
        {
          description: 'Has DOCTYPE declaration',
          expected: true,
          test: 'document.doctype !== null'
        },
        {
          description: 'Has title element',
          expected: true,
          test: 'document.querySelector("title") !== null'
        },
        {
          description: 'Has h1 element',
          expected: true,
          test: 'document.querySelector("h1") !== null'
        },
        {
          description: 'Has paragraph element',
          expected: true,
          test: 'document.querySelector("p") !== null'
        }
      ],
      difficulty: 'BEGINNER',
      language: 'JAVASCRIPT',
      tags: ['HTML', 'Structure', 'Basics'],
      hints: [
        'Remember to include the DOCTYPE declaration at the top',
        'The title goes in the head section',
        'Use semantic HTML elements for better structure'
      ],
      lessonId: htmlLesson.id,
      order: 1,
      isPublished: true,
    },
  });

  const jsChallenge = await db.challenge.create({
    data: {
      title: 'JavaScript Calculator',
      description: 'Build a simple calculator function.',
      instructions: `Create a calculator function that:

1. Takes two numbers and an operation as parameters
2. Supports addition, subtraction, multiplication, and division
3. Returns the result of the operation
4. Handles division by zero`,
      startingCode: `function calculator(num1, num2, operation) {
    // Your code here
}`,
      solution: `function calculator(num1, num2, operation) {
    switch (operation) {
        case 'add':
            return num1 + num2;
        case 'subtract':
            return num1 - num2;
        case 'multiply':
            return num1 * num2;
        case 'divide':
            if (num2 === 0) {
                return 'Error: Division by zero';
            }
            return num1 / num2;
        default:
            return 'Error: Invalid operation';
    }
}`,
      testCases: [
        {
          description: 'Addition works correctly',
          input: [5, 3, 'add'],
          expected: 8
        },
        {
          description: 'Subtraction works correctly',
          input: [10, 4, 'subtract'],
          expected: 6
        },
        {
          description: 'Multiplication works correctly',
          input: [3, 7, 'multiply'],
          expected: 21
        },
        {
          description: 'Division works correctly',
          input: [15, 3, 'divide'],
          expected: 5
        },
        {
          description: 'Handles division by zero',
          input: [10, 0, 'divide'],
          expected: 'Error: Division by zero'
        }
      ],
      difficulty: 'BEGINNER',
      language: 'JAVASCRIPT',
      tags: ['JavaScript', 'Functions', 'Logic'],
      hints: [
        'Use a switch statement to handle different operations',
        'Check for division by zero before dividing',
        'Return appropriate error messages for invalid inputs'
      ],
      lessonId: jsLesson.id,
      order: 1,
      isPublished: true,
    },
  });

  const pythonChallenge = await db.challenge.create({
    data: {
      title: 'Python List Operations',
      description: 'Practice working with Python lists.',
      instructions: `Create a function that:

1. Takes a list of numbers as input
2. Returns a dictionary with:
   - 'sum': sum of all numbers
   - 'average': average of all numbers
   - 'max': maximum number
   - 'min': minimum number`,
      startingCode: `def analyze_numbers(numbers):
    # Your code here
    pass`,
      solution: `def analyze_numbers(numbers):
    if not numbers:
        return {'sum': 0, 'average': 0, 'max': null, 'min': null}
    
    total = sum(numbers)
    avg = total / len(numbers)
    maximum = max(numbers)
    minimum = min(numbers)
    
    return {
        'sum': total,
        'average': avg,
        'max': maximum,
        'min': minimum
    }`,
      testCases: [
        {
          description: 'Works with positive numbers',
          input: [[1, 2, 3, 4, 5]],
          expected: {'sum': 15, 'average': 3.0, 'max': 5, 'min': 1}
        },
        {
          description: 'Works with negative numbers',
          input: [[-1, -2, -3]],
          expected: {'sum': -6, 'average': -2.0, 'max': -1, 'min': -3}
        },
        {
          description: 'Handles empty list',
          input: [[]],
          expected: {'sum': 0, 'average': 0, 'max': null, 'min': null}
        }
      ],
      difficulty: 'BEGINNER',
      language: 'PYTHON',
      tags: ['Python', 'Lists', 'Functions'],
      hints: [
        'Use built-in functions like sum(), max(), min()',
        'Handle the empty list case',
        'Calculate average by dividing sum by length'
      ],
      lessonId: pythonLesson.id,
      order: 1,
      isPublished: true,
    },
  });

  console.log('🎯 Created sample challenges');

  // Create sample progress records
  await db.progress.create({
    data: {
      userId: studentUser.id,
      trackId: webDevelopmentTrack.id,
      status: 'IN_PROGRESS',
      score: 75.5,
      timeSpent: 120,
      startedAt: new Date(),
    },
  });

  await db.progress.create({
    data: {
      userId: studentUser.id,
      lessonId: htmlLesson.id,
      status: 'COMPLETED',
      score: 95.0,
      timeSpent: 45,
      startedAt: new Date(Date.now() - 86400000), // 1 day ago
      completedAt: new Date(Date.now() - 86400000 + 2700000), // 45 minutes later
    },
  });

  console.log('📊 Created sample progress records');

  // Create sample submissions
  await db.submission.create({
    data: {
      userId: studentUser.id,
      challengeId: htmlChallenge.id,
      code: `<!DOCTYPE html>
<html>
<head>
    <title>My Web Page</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is my first webpage.</p>
</body>
</html>`,
      language: 'JAVASCRIPT',
      status: 'COMPLETED',
      score: 85.0,
      testResults: {
        passed: 3,
        total: 4,
        details: [
          { test: 'Has DOCTYPE declaration', passed: true },
          { test: 'Has title element', passed: true },
          { test: 'Has h1 element', passed: true },
          { test: 'Has paragraph element', passed: false }
        ]
      },
    },
  });

  console.log('💻 Created sample submissions');

  // Create sample chat history
  await db.chatHistory.createMany({
    data: [
      {
        userId: studentUser.id,
        message: 'Can you help me understand CSS selectors?',
        role: 'USER',
        context: {
          lessonId: cssLesson.id,
          topic: 'CSS Selectors'
        },
      },
      {
        userId: studentUser.id,
        message: 'CSS selectors are patterns used to select elements you want to style. There are several types: element selectors (like `p`), class selectors (like `.my-class`), and ID selectors (like `#my-id`). Would you like me to explain any specific type?',
        role: 'ASSISTANT',
        context: {
          lessonId: cssLesson.id,
          topic: 'CSS Selectors'
        },
      },
      {
        userId: studentUser.id,
        message: 'What\'s the difference between class and ID selectors?',
        role: 'USER',
        context: {
          lessonId: cssLesson.id,
          topic: 'CSS Selectors'
        },
      },
      {
        userId: studentUser.id,
        message: 'Great question! The main differences are:\n\n1. **Uniqueness**: IDs should be unique (only one element per page), while classes can be used on multiple elements\n2. **Specificity**: ID selectors have higher specificity than class selectors\n3. **Syntax**: IDs use `#` (like `#header`) and classes use `.` (like `.button`)\n\nUse classes for styling multiple elements and IDs for unique elements or JavaScript targeting.',
        role: 'ASSISTANT',
        context: {
          lessonId: cssLesson.id,
          topic: 'CSS Selectors'
        },
      },
    ],
  });

  console.log('💬 Created sample chat history');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log('   👥 Users: 2 (1 student, 1 instructor)');
  console.log('   📚 Tracks: 3 (Web Dev, React, Python)');
  console.log('   📖 Lessons: 5 (across all tracks)');
  console.log('   🎯 Challenges: 3 (HTML, JS, Python)');
  console.log('   📊 Progress records: 2');
  console.log('   💻 Submissions: 1');
  console.log('   💬 Chat messages: 4');
  
  await db.$disconnect();
}

seed().catch(async (e) => {
  console.error('❌ Seed failed:', e);
  await db.$disconnect();
  process.exit(1);
});

