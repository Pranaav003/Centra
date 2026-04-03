import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { CHROME_WEB_STORE_URL } from '@/constants/chromeWebStore';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div 
        className="bg-[#2a2a2a]/80 backdrop-blur-md rounded-full px-6 py-2.5 shadow-2xl border border-white/10"
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between space-x-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Centra</span>
          </motion.div>

          {/* Navigation Links */}
          <motion.nav 
            className="hidden md:flex items-center space-x-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <a href="#features" className="text-gray-200 hover:text-white transition-all duration-200 font-medium text-sm tracking-wide hover:scale-105">
              Features
            </a>
            <a href="#testimonials" className="text-gray-200 hover:text-white transition-all duration-200 font-medium text-sm tracking-wide hover:scale-105">
              Reviews
            </a>
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-white transition-all duration-200 font-medium text-sm tracking-wide hover:scale-105"
            >
              Download
            </a>
          </motion.nav>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm tracking-wide border-0 hover:scale-105">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={logout}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm tracking-wide border-0 hover:scale-105"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm tracking-wide border-0 hover:scale-105 animate-gradient-bg bg-[length:200%_200%]">
                  Sign In
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>
    </header>
  )
}

export default Header
