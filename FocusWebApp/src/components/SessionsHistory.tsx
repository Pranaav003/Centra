import React from 'react';

const SessionsHistory: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Focus Sessions History</h1>
        <p className="text-gray-400 mb-6">
          Complete overview of all your focus sessions with advanced filtering and export options
        </p>
        
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Sessions History</h2>
            <p className="text-gray-400 mb-4">This page will show all your focus sessions in a comprehensive table format.</p>
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.open('/dashboard', '_blank')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Open Dashboard in New Tab
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Features Coming Soon:</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Comprehensive sessions table with all details</li>
            <li>• Advanced search and filtering options</li>
            <li>• Export to CSV functionality</li>
            <li>• Session statistics and analytics</li>
            <li>• Progress tracking and goal completion</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SessionsHistory;
