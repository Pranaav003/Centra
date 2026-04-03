import React from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CHROME_WEB_STORE_URL } from '@/constants/chromeWebStore'

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Static Floating Elements */}
      <motion.div 
        className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-40 right-20 w-48 h-48 bg-primary/20 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div 
        className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-lg"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main Headline */}
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          It's like <span className="text-gray-500 font-medium tracking-wide bg-gradient-to-r from-gray-500/20 to-gray-400/20 px-0.25 py-0.25 rounded-lg backdrop-blur-sm border border-gray-600/30">
            Do Not Disturb
          </span> for your Browser
          <br />
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span>
            <span>
              Crush procrastination, and start <span className="bg-gradient-to-r from-rose-400 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent font-black animate-gradient bg-[length:200%_200%]">getting things done.</span>
            </span>
            <br />
            <span>
              Boost your productivity with comprehensive blocking.
            </span>
          </span>
        </motion.p>

        {/* Community Section */}
        <motion.div 
          className="flex flex-col items-center space-y-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Community Text */}
          <p className="text-base text-gray-300">
            Join <span className="text-primary font-semibold">5000+</span> users.
          </p>
          
          {/* Profile Circles */}
          <div className="flex items-center -space-x-2">
            {/* Profile 1 */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-[#2a2a2a] shadow-lg">
              <span className="text-xs">👨</span>
            </div>
            
            {/* Profile 2 */}
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-[#2a2a2a] shadow-lg">
              <span className="text-xs">👩</span>
            </div>
            
            {/* Profile 3 */}
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-[#2a2a2a] shadow-lg">
              <span className="text-xs">👨‍💻</span>
            </div>
            
            {/* Profile 4 */}
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-[#2a2a2a] shadow-lg">
              <span className="text-xs">👩‍🎓</span>
            </div>
            
            {/* Profile 5 - Count */}
            <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-[#3a3a3a] shadow-lg">
              5k+
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-primary/25 transition-all duration-300 animate-gradient-bg bg-[length:200%_200%]" asChild>
            <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Shield className="w-5 h-5 mr-2" />
              Add to Browser
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
