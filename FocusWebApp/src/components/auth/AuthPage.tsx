import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { SEO } from '../SEO';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <SEO
        title="Login | Centra"
        description="Sign in to your Centra account to access your dashboard, blocked sites, and productivity analytics."
        noindex={true}
      />
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Logo Header */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="flex items-center space-x-2.5 text-white hover:text-gray-300 transition-colors duration-200">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Centra</span>
        </Link>
      </div>
      
      <div className="w-full">
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
    </>
  );
};
