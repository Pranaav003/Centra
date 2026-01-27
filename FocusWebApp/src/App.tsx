import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import QuoteTester from './components/QuoteTester';
import SessionsHistory from './components/SessionsHistory';
import TestSessions from './components/TestSessions';
import RedirectPage from './components/RedirectPage';
import BreakPage from './components/BreakPage';
import { SEO } from './components/SEO';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Debug logging
  console.log('ProtectedRoute render:', { user, isLoading });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  console.log('User authenticated, rendering dashboard');
  return <>{children}</>;
};

// Landing Page Component
const LandingPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <>
      <SEO
        title="Centra - Block Distractions & Boost Productivity | Chrome Extension"
        description="Block distracting websites like YouTube, Facebook, Reddit, and more. Stay focused with Centra - the ultimate productivity Chrome extension. Schedule blocking, AI analytics, and unlimited site blocking for Pro users."
        keywords="website blocker, productivity, focus, distraction blocker, chrome extension, block websites, stay focused, productivity tool, time management, block youtube, block social media, focus app"
      />
      <div className="min-h-screen bg-[#1a1a1a]">
        <Header />
        <main>
          <Hero />
          <Features />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quote-tester" 
            element={<QuoteTester />} 
          />
          <Route 
            path="/sessions-history" 
            element={<SessionsHistory />} 
          />
          <Route 
            path="/test-sessions" 
            element={<TestSessions />} 
          />
          <Route 
            path="/redirect" 
            element={<RedirectPage />} 
          />
          <Route 
            path="/break" 
            element={<BreakPage />} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
