#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure generated directory exists
const generatedDir = path.join(__dirname, 'generated');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Generate TypeScript types using ts-proto
const protoPath = path.join(__dirname, '../../server/code-executor/proto');
const protoFile = path.join(protoPath, 'executor.proto');

console.log('Generating TypeScript types from proto files...');
console.log('Proto path:', protoPath);
console.log('Proto file:', protoFile);

// Check if proto file exists
if (!fs.existsSync(protoFile)) {
  console.error('Proto file not found:', protoFile);
  process.exit(1);
}

try {
  // Use ts-proto to generate TypeScript types
  execSync(`npx ts-proto --outputServices=grpc-js --outputClientImpl=false --outputJsonMethods=false --outputPartialMethods=false --oneofKind=scalar --outputIndex=true --proto_path=${protoPath} --out=${generatedDir} ${protoFile}`, { stdio: 'inherit' });
  console.log('Proto generation completed!');
} catch (error) {
  console.error('Error generating proto types:', error.message);
  process.exit(1);
}
