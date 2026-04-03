import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import { CHROME_WEB_STORE_URL } from '@/constants/chromeWebStore'

const INSTAGRAM_URL = 'https://www.instagram.com/life.of.pranaav/'

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#1a1a1a]">
      {/* Building strip */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-white/5 py-2.5">
        <p className="text-center text-sm text-gray-300 font-medium">
          Building 12 products in 12 months. Product 2.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
            <span>@life.of.pranaav</span>
          </a>
          <p className="text-gray-500 text-sm">
            Made by Pranaav
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 underline-offset-2 hover:underline"
            >
              Chrome Web Store
            </a>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors duration-200 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Centra. A focus & productivity tool.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
