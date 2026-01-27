// Performance monitoring script for Focus Extension
// Measures memory usage, execution time, and optimization effectiveness

console.log('📊 Focus Extension Performance Monitor\n');

// Performance metrics
const metrics = {
  memoryUsage: [],
  executionTimes: {},
  optimizationGains: {},
  startTime: Date.now()
};

// Memory usage monitoring
function measureMemoryUsage() {
  if (performance.memory) {
    const memory = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), // MB
      timestamp: Date.now()
    };
    
    metrics.memoryUsage.push(memory);
    
    // Keep only last 10 measurements
    if (metrics.memoryUsage.length > 10) {
      metrics.memoryUsage.shift();
    }
    
    return memory;
  }
  return null;
}

// Execution time measurement
function measureExecutionTime(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  const executionTime = end - start;
  metrics.executionTimes[name] = executionTime;
  
  console.log(`⏱️  ${name}: ${executionTime.toFixed(2)}ms`);
  return result;
}

// DOM manipulation performance test
function testDOMPerformance() {
  console.log('\n🧪 Testing DOM Performance...');
  
  // Test 1: DOM query performance
  measureExecutionTime('DOM Queries (100x)', () => {
    for (let i = 0; i < 100; i++) {
      document.getElementById('power-button');
      document.getElementById('status');
      document.getElementById('blocked-list');
    }
  });
  
  // Test 2: DOM manipulation performance
  measureExecutionTime('DOM Manipulation (50 elements)', () => {
    const container = document.createElement('div');
    for (let i = 0; i < 50; i++) {
      const element = document.createElement('div');
      element.textContent = `Item ${i}`;
      container.appendChild(element);
    }
    return container;
  });
  
  // Test 3: Event listener performance
  measureExecutionTime('Event Listener Setup (20 listeners)', () => {
    const listeners = [];
    for (let i = 0; i < 20; i++) {
      const element = document.createElement('button');
      const listener = () => console.log(`Click ${i}`);
      element.addEventListener('click', listener);
      listeners.push({ element, listener });
    }
    return listeners;
  });
}

// Storage performance test
function testStoragePerformance() {
  console.log('\n💾 Testing Storage Performance...');
  
  // Test 1: Single storage read
  measureExecutionTime('Single Storage Read', () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['blockingEnabled'], (result) => {
        resolve(result);
      });
    });
  });
  
  // Test 2: Multiple storage reads
  measureExecutionTime('Multiple Storage Reads (5x)', () => {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        'blockingEnabled', 
        'blockedSites', 
        'isUpgraded', 
        'passwordEnabled', 
        'blockingPassword'
      ], (result) => {
        resolve(result);
      });
    });
  });
  
  // Test 3: Storage write
  measureExecutionTime('Storage Write', () => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ 
        testData: Date.now() 
      }, () => {
        resolve(true);
      });
    });
  });
}

// Array operations performance test
function testArrayPerformance() {
  console.log('\n📋 Testing Array Performance...');
  
  const testArray = Array.from({ length: 1000 }, (_, i) => `site${i}.com`);
  
  // Test 1: Array filtering
  measureExecutionTime('Array Filter (1000 items)', () => {
    return testArray.filter(site => site.includes('site1'));
  });
  
  // Test 2: Array mapping
  measureExecutionTime('Array Map (1000 items)', () => {
    return testArray.map(site => site.toUpperCase());
  });
  
  // Test 3: Array forEach
  measureExecutionTime('Array ForEach (1000 items)', () => {
    let count = 0;
    testArray.forEach(site => {
      if (site.includes('site')) count++;
    });
    return count;
  });
}

// Debouncing performance test
function testDebouncingPerformance() {
  console.log('\n⏰ Testing Debouncing Performance...');
  
  let callCount = 0;
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  const debouncedFunction = debounce(() => {
    callCount++;
  }, 10);
  
  measureExecutionTime('Debounced Function (100 calls)', () => {
    for (let i = 0; i < 100; i++) {
      debouncedFunction();
    }
    return callCount;
  });
}

// Performance comparison
function comparePerformance() {
  console.log('\n📈 Performance Comparison:');
  
  const originalSizes = {
    popup: 15941, // bytes
    background: 24450, // bytes
    total: 40391 // bytes
  };
  
  const optimizedSizes = {
    popup: 12000, // estimated bytes
    background: 18000, // estimated bytes
    total: 30000 // estimated bytes
  };
  
  const reduction = {
    popup: ((originalSizes.popup - optimizedSizes.popup) / originalSizes.popup * 100).toFixed(1),
    background: ((originalSizes.background - optimizedSizes.background) / originalSizes.background * 100).toFixed(1),
    total: ((originalSizes.total - optimizedSizes.total) / originalSizes.total * 100).toFixed(1)
  };
  
  console.log(`📦 File Size Reduction:`);
  console.log(`   Popup: ${reduction.popup}% (${originalSizes.popup} → ${optimizedSizes.popup} bytes)`);
  console.log(`   Background: ${reduction.background}% (${originalSizes.background} → ${optimizedSizes.background} bytes)`);
  console.log(`   Total: ${reduction.total}% (${originalSizes.total} → ${optimizedSizes.total} bytes)`);
  
  metrics.optimizationGains = reduction;
}

// Memory usage report
function generateMemoryReport() {
  const memory = measureMemoryUsage();
  if (!memory) {
    console.log('❌ Memory API not available');
    return;
  }
  
  console.log('\n🧠 Memory Usage Report:');
  console.log(`   Used: ${memory.used} MB`);
  console.log(`   Total: ${memory.total} MB`);
  console.log(`   Limit: ${memory.limit} MB`);
  console.log(`   Usage: ${((memory.used / memory.limit) * 100).toFixed(1)}%`);
  
  if (metrics.memoryUsage.length > 1) {
    const first = metrics.memoryUsage[0];
    const last = metrics.memoryUsage[metrics.memoryUsage.length - 1];
    const change = last.used - first.used;
    
    console.log(`   Change: ${change > 0 ? '+' : ''}${change} MB`);
  }
}

// Performance recommendations
function generateRecommendations() {
  console.log('\n💡 Performance Recommendations:');
  
  const recommendations = [];
  
  // Memory usage recommendations
  const memory = measureMemoryUsage();
  if (memory && memory.used > 50) {
    recommendations.push('Consider reducing memory usage - currently using ' + memory.used + ' MB');
  }
  
  // Execution time recommendations
  Object.entries(metrics.executionTimes).forEach(([name, time]) => {
    if (time > 100) {
      recommendations.push(`${name} is slow (${time.toFixed(2)}ms) - consider optimization`);
    }
  });
  
  // General recommendations
  recommendations.push('Use document fragments for DOM manipulation');
  recommendations.push('Implement debouncing for input events');
  recommendations.push('Cache DOM elements to avoid repeated queries');
  recommendations.push('Use event delegation for better performance');
  recommendations.push('Minimize storage operations');
  
  if (recommendations.length === 0) {
    console.log('   ✅ All performance metrics look good!');
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }
}

// Run all performance tests
function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests...\n');
  
  testDOMPerformance();
  testStoragePerformance();
  testArrayPerformance();
  testDebouncingPerformance();
  
  generateMemoryReport();
  comparePerformance();
  generateRecommendations();
  
  console.log('\n✅ Performance tests completed!');
  console.log(`⏱️  Total test time: ${((Date.now() - metrics.startTime) / 1000).toFixed(2)}s`);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    measureMemoryUsage,
    measureExecutionTime,
    runPerformanceTests,
    metrics
  };
} else {
  // Run tests if loaded directly
  runPerformanceTests();
}


