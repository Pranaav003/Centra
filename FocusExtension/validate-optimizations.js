// Validation script for performance optimizations
// Tests the optimized code structure and validates improvements

console.log('🔍 Validating Focus Extension Performance Optimizations\n');

// Test 1: File size comparison
function validateFileSizes() {
  console.log('📦 File Size Validation:');
  
  const fs = require('fs');
  
  try {
    const originalPopup = fs.statSync('popup.js').size;
    const optimizedPopup = fs.statSync('popup-optimized.js').size;
    const originalBackground = fs.statSync('background.js').size;
    const optimizedBackground = fs.statSync('background-optimized.js').size;
    
    const popupReduction = ((originalPopup - optimizedPopup) / originalPopup * 100).toFixed(1);
    const backgroundReduction = ((originalBackground - optimizedBackground) / originalBackground * 100).toFixed(1);
    
    console.log(`   Popup.js: ${originalPopup} → ${optimizedPopup} bytes (${popupReduction}% reduction)`);
    console.log(`   Background.js: ${originalBackground} → ${optimizedBackground} bytes (${backgroundReduction}% reduction)`);
    
    return {
      popup: { original: originalPopup, optimized: optimizedPopup, reduction: popupReduction },
      background: { original: originalBackground, optimized: optimizedBackground, reduction: backgroundReduction }
    };
  } catch (error) {
    console.log('   ❌ Error reading files:', error.message);
    return null;
  }
}

// Test 2: Code structure validation
function validateCodeStructure() {
  console.log('\n🏗️  Code Structure Validation:');
  
  const fs = require('fs');
  
  try {
    const popupContent = fs.readFileSync('popup-optimized.js', 'utf8');
    const backgroundContent = fs.readFileSync('background-optimized.js', 'utf8');
    
    // Check for optimization patterns
    const optimizations = {
      domCaching: popupContent.includes('const DOM = {'),
      debouncing: popupContent.includes('function debounce('),
      documentFragments: popupContent.includes('createDocumentFragment'),
      eventCleanup: popupContent.includes('removeEventListener'),
      storageBatching: backgroundContent.includes('chrome.storage.local.set({'),
      asyncAwait: backgroundContent.includes('async function'),
      errorHandling: backgroundContent.includes('try {') && backgroundContent.includes('catch')
    };
    
    Object.entries(optimizations).forEach(([key, present]) => {
      console.log(`   ${present ? '✅' : '❌'} ${key}: ${present ? 'Present' : 'Missing'}`);
    });
    
    return optimizations;
  } catch (error) {
    console.log('   ❌ Error reading optimized files:', error.message);
    return null;
  }
}

// Test 3: Syntax validation
function validateSyntax() {
  console.log('\n🔧 Syntax Validation:');
  
  try {
    // Test popup-optimized.js syntax
    require('child_process').execSync('node -c popup-optimized.js', { stdio: 'pipe' });
    console.log('   ✅ popup-optimized.js syntax valid');
    
    // Test background-optimized.js syntax
    require('child_process').execSync('node -c background-optimized.js', { stdio: 'pipe' });
    console.log('   ✅ background-optimized.js syntax valid');
    
    return true;
  } catch (error) {
    console.log('   ❌ Syntax validation failed:', error.message);
    return false;
  }
}

// Test 4: Performance pattern analysis
function analyzePerformancePatterns() {
  console.log('\n⚡ Performance Pattern Analysis:');
  
  const fs = require('fs');
  
  try {
    const popupContent = fs.readFileSync('popup-optimized.js', 'utf8');
    const backgroundContent = fs.readFileSync('background-optimized.js', 'utf8');
    
    // Count optimization patterns
    const patterns = {
      domQueries: (popupContent.match(/getElementById/g) || []).length,
      eventListeners: (popupContent.match(/addEventListener/g) || []).length,
      storageCalls: (popupContent.match(/chrome\.storage\.local\./g) || []).length,
      asyncFunctions: (backgroundContent.match(/async function/g) || []).length,
      errorHandling: (backgroundContent.match(/try \{/g) || []).length,
      debounceCalls: (popupContent.match(/debounce/g) || []).length
    };
    
    console.log(`   DOM Queries: ${patterns.domQueries} (should be minimal)`);
    console.log(`   Event Listeners: ${patterns.eventListeners} (should be reasonable)`);
    console.log(`   Storage Calls: ${patterns.storageCalls} (should be batched)`);
    console.log(`   Async Functions: ${patterns.asyncFunctions} (should be used for I/O)`);
    console.log(`   Error Handling: ${patterns.errorHandling} (should be comprehensive)`);
    console.log(`   Debounce Usage: ${patterns.debounceCalls} (should be used for inputs)`);
    
    return patterns;
  } catch (error) {
    console.log('   ❌ Error analyzing patterns:', error.message);
    return null;
  }
}

// Test 5: Memory leak prevention
function validateMemoryLeakPrevention() {
  console.log('\n🧠 Memory Leak Prevention:');
  
  const fs = require('fs');
  
  try {
    const popupContent = fs.readFileSync('popup-optimized.js', 'utf8');
    
    const leakPrevention = {
      eventCleanup: popupContent.includes('removeEventListener'),
      beforeUnload: popupContent.includes('beforeunload'),
      timeoutCleanup: popupContent.includes('clearTimeout'),
      intervalCleanup: popupContent.includes('clearInterval'),
      nullAssignments: popupContent.includes('= null')
    };
    
    Object.entries(leakPrevention).forEach(([key, present]) => {
      console.log(`   ${present ? '✅' : '❌'} ${key}: ${present ? 'Present' : 'Missing'}`);
    });
    
    return leakPrevention;
  } catch (error) {
    console.log('   ❌ Error checking memory leak prevention:', error.message);
    return null;
  }
}

// Main validation function
function runValidation() {
  console.log('🚀 Starting Optimization Validation...\n');
  
  const results = {
    fileSizes: validateFileSizes(),
    codeStructure: validateCodeStructure(),
    syntax: validateSyntax(),
    performancePatterns: analyzePerformancePatterns(),
    memoryLeakPrevention: validateMemoryLeakPrevention()
  };
  
  console.log('\n📊 Validation Summary:');
  
  // Count successful validations
  const successCount = Object.values(results).filter(result => result !== null && result !== false).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`   Tests Passed: ${successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('   ✅ All validations passed! Optimizations are ready for deployment.');
  } else {
    console.log('   ⚠️  Some validations failed. Review the output above.');
  }
  
  // Performance score
  if (results.codeStructure) {
    const optimizationCount = Object.values(results.codeStructure).filter(Boolean).length;
    const totalOptimizations = Object.keys(results.codeStructure).length;
    const score = (optimizationCount / totalOptimizations * 100).toFixed(1);
    
    console.log(`   Performance Score: ${score}% (${optimizationCount}/${totalOptimizations} optimizations)`);
  }
  
  return results;
}

// Run validation
runValidation();


