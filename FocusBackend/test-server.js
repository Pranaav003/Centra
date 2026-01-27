const request = require('supertest');
const express = require('express');
const app = require('./server');

// Simple test to check if server responds
const testServer = async () => {
  try {
    console.log('Testing server endpoints...');
    
    // Test root endpoint
    const response = await request(app).get('/');
    console.log('Root endpoint:', response.status, response.body);
    
    // Test health endpoint
    const healthResponse = await request(app).get('/health');
    console.log('Health endpoint:', healthResponse.status, healthResponse.body);
    
    console.log('Server test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testServer();
}
