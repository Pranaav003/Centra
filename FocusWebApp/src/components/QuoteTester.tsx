import React, { useState } from 'react';
import { dailyQuotes, getTodaysQuote, getRandomQuote, getQuotesByCategory, testQuoteSystem, DailyQuote } from '../data/dailyQuotes';

const QuoteTester: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<DailyQuote['category']>('productivity');
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Today's quote
    const todaysQuote = getTodaysQuote();
    results.push(`✅ Today's Quote: "${todaysQuote.text}" - ${todaysQuote.author}`);
    
    // Test 2: Random quote
    const randomQuote = getRandomQuote();
    results.push(`✅ Random Quote: "${randomQuote.text}" - ${randomQuote.author}`);
    
    // Test 3: Category quotes
    const categoryQuotes = getQuotesByCategory(selectedCategory);
    results.push(`✅ ${selectedCategory} quotes: ${categoryQuotes.length} available`);
    
    // Test 4: Total quotes
    results.push(`✅ Total quotes available: ${dailyQuotes.length}`);
    
    // Test 5: Different days (simulate)
    const testDates = [
      new Date(2024, 0, 1), // Jan 1
      new Date(2024, 1, 15), // Feb 15
      new Date(2024, 5, 21), // June 21
      new Date(2024, 11, 31), // Dec 31
    ];
    
    testDates.forEach((date, index) => {
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const quoteIndex = dayOfYear % dailyQuotes.length;
      const quote = dailyQuotes[quoteIndex];
      results.push(`✅ ${date.toLocaleDateString()}: "${quote.text.substring(0, 50)}..."`);
    });
    
    setTestResults(results);
    
    // Also run console test
    testQuoteSystem();
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Daily Quote System Tester</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Quote Statistics</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Quotes:</span>
              <span className="font-bold text-blue-400">{dailyQuotes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Productivity:</span>
              <span className="font-bold text-green-400">{getQuotesByCategory('productivity').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Focus:</span>
              <span className="font-bold text-yellow-400">{getQuotesByCategory('focus').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Motivation:</span>
              <span className="font-bold text-red-400">{getQuotesByCategory('motivation').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Success:</span>
              <span className="font-bold text-purple-400">{getQuotesByCategory('success').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Wisdom:</span>
              <span className="font-bold text-cyan-400">{getQuotesByCategory('wisdom').length}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Today's Quote</h2>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-200 text-lg italic mb-2">"{getTodaysQuote().text}"</p>
            <p className="text-blue-300 text-sm">— {getTodaysQuote().author}</p>
            <p className="text-blue-400 text-xs mt-2">Category: {getTodaysQuote().category}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-2">Category Filter:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as DailyQuote['category'])}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="productivity">Productivity</option>
              <option value="focus">Focus</option>
              <option value="motivation">Motivation</option>
              <option value="success">Success</option>
              <option value="wisdom">Wisdom</option>
            </select>
          </div>
          
          <button 
            onClick={runTests}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Run Tests
          </button>
          
          <button 
            onClick={clearResults}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>
      
      {testResults.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
                {result}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            💡 Check the browser console for additional test output
          </p>
        </div>
      )}
      
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Sample Quotes by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getQuotesByCategory(selectedCategory).slice(0, 6).map((quote) => (
            <div key={quote.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
              <p className="text-gray-200 text-sm italic mb-2">"{quote.text}"</p>
              <p className="text-gray-400 text-xs">— {quote.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuoteTester;
