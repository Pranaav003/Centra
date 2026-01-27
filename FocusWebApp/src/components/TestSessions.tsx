import React from 'react';

const TestSessions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Test Sessions Page</h1>
        <p className="text-gray-400">This is a test page to see if routing works.</p>
        <div className="mt-4">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestSessions;
