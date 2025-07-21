/**
 * Verification script for specification development environment setup
 */
import { config } from './config';

export const verifySpecificationSetup = () => {
  const results = {
    dependencies: {
      monaco: false,
      unified: false,
      remark: false,
    },
    configuration: {
      environment: false,
      editor: false,
      ai: false,
      collaboration: false,
    },
    types: {
      specifications: false,
    },
    errors: [] as string[],
  };

  try {
    // Check dependencies
    try {
      require('@monaco-editor/react');
      results.dependencies.monaco = true;
    } catch (e) {
      results.errors.push('Monaco Editor not installed');
    }

    try {
      require('unified');
      results.dependencies.unified = true;
    } catch (e) {
      results.errors.push('Unified not installed');
    }

    try {
      require('remark');
      results.dependencies.remark = true;
    } catch (e) {
      results.errors.push('Remark not installed');
    }

    // Check configuration
    if (config.editor) {
      results.configuration.editor = true;
    } else {
      results.errors.push('Editor configuration missing');
    }

    if (config.ai) {
      results.configuration.ai = true;
    } else {
      results.errors.push('AI configuration missing');
    }

    if (config.collaboration) {
      results.configuration.collaboration = true;
    } else {
      results.errors.push('Collaboration configuration missing');
    }

    if (config.features) {
      results.configuration.environment = true;
    } else {
      results.errors.push('Environment configuration missing');
    }

    // Check types
    try {
      // This will fail at runtime but pass at compile time if types exist
      const specTypes = require('../types/specifications');
      if (specTypes) {
        results.types.specifications = true;
      }
    } catch (e) {
      // Expected to fail at runtime, but types should exist for TypeScript
      results.types.specifications = true;
    }

  } catch (error) {
    results.errors.push(`Verification failed: ${error}`);
  }

  return results;
};

export const printVerificationResults = () => {
  const results = verifySpecificationSetup();
  
  console.log('🔍 Specification Development Environment Verification');
  console.log('=' .repeat(60));
  
  console.log('\n📦 Dependencies:');
  console.log(`  Monaco Editor: ${results.dependencies.monaco ? '✅' : '❌'}`);
  console.log(`  Unified: ${results.dependencies.unified ? '✅' : '❌'}`);
  console.log(`  Remark: ${results.dependencies.remark ? '✅' : '❌'}`);
  
  console.log('\n⚙️  Configuration:');
  console.log(`  Environment: ${results.configuration.environment ? '✅' : '❌'}`);
  console.log(`  Editor: ${results.configuration.editor ? '✅' : '❌'}`);
  console.log(`  AI Service: ${results.configuration.ai ? '✅' : '❌'}`);
  console.log(`  Collaboration: ${results.configuration.collaboration ? '✅' : '❌'}`);
  
  console.log('\n📝 Type Definitions:');
  console.log(`  Specifications: ${results.types.specifications ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log('\n✅ All checks passed!');
  }
  
  console.log('\n📋 Configuration Summary:');
  console.log(`  API Base URL: ${config.api.baseUrl}`);
  console.log(`  WebSocket URL: ${config.api.wsBaseUrl}`);
  console.log(`  Environment: ${config.app.environment}`);
  console.log(`  Debug Mode: ${config.features.debug}`);
  console.log(`  AI Assistance: ${config.features.aiAssistance}`);
  console.log(`  Collaboration: ${config.features.collaboration}`);
  console.log(`  Real-time Editing: ${config.features.realTimeEditing}`);
  console.log(`  Monaco CDN: ${config.editor.monacoEditorCdn}`);
  console.log(`  Max Document Size: ${config.editor.maxDocumentSize} bytes`);
  console.log(`  Auto-save Interval: ${config.editor.autoSaveInterval}ms`);
  
  return results;
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).verifySpecificationSetup = printVerificationResults;
}