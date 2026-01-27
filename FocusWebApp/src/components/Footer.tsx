import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, Twitter, Github, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Centra</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              The ultimate productivity tool to help you stay focused and get things done.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Product Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#changelog" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Changelog
                </a>
              </li>
              <li>
                <a href="#roadmap" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#integrations" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Integrations
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Company Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#careers" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Careers
                </a>
              </li>
              <li>
                <a href="#press" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Press Kit
                </a>
              </li>
              <li>
                <a href="#partners" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Partners
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Resources Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#docs" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#support" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Support
                </a>
              </li>
              <li>
                <a href="#community" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Community
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#status" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Status Page
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Legal Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#security" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Security
                </a>
              </li>
              <li>
                <a href="#compliance" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Compliance
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div 
          className="border-t border-white/10 pt-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest updates, tips, and productivity insights delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-lg font-medium transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Centra. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <a href="#accessibility" className="text-gray-400 hover:text-white transition-colors duration-200">
              Accessibility
            </a>
            <a href="#sitemap" className="text-gray-400 hover:text-white transition-colors duration-200">
              Sitemap
            </a>
            <a href="#contact" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
