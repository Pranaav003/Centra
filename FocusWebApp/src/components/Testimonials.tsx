import React from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Developer",
    content: "Centra has completely transformed my productivity. I can finally work without YouTube distractions. The interface is clean and the blocking is comprehensive.",
    rating: 5,
    avatar: "SC",
    verified: true,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    name: "Mike Rodriguez",
    role: "Student",
    content: "As a student, I was constantly getting distracted by social media. This extension helps me stay focused during study sessions. Highly recommended!",
    rating: 5,
    avatar: "MR",
    verified: true,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    name: "Emily Watson",
    role: "Freelance Writer",
    content: "I've tried many focus tools, but this one is the best. The customizable blocking and easy toggle make it perfect for my workflow.",
    rating: 5,
    avatar: "EW",
    verified: true,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    name: "David Kim",
    role: "Product Manager",
    content: "The full YouTube coverage is amazing. Other blockers couldn't handle embedded videos, but this one does it perfectly.",
    rating: 5,
    avatar: "DK",
    verified: true,
    gradient: "from-orange-500 to-red-500"
  },
  {
    name: "Lisa Thompson",
    role: "Remote Worker",
    content: "Working from home was a challenge with so many distractions. This extension has been a game-changer for my productivity.",
    rating: 5,
    avatar: "LT",
    verified: true,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    name: "Alex Johnson",
    role: "Entrepreneur",
    content: "Simple, effective, and privacy-focused. Exactly what I needed to stay productive in today's distracting digital world.",
    rating: 5,
    avatar: "AJ",
    verified: true,
    gradient: "from-pink-500 to-rose-500"
  },
  {
    name: "James Wilson",
    role: "Designer",
    content: "This extension has revolutionized my workflow. I can finally concentrate on my design projects without constant interruptions.",
    rating: 5,
    avatar: "JW",
    verified: true,
    gradient: "from-teal-500 to-blue-500"
  },
  {
    name: "Maria Garcia",
    role: "Researcher",
    content: "As a researcher, I need deep focus. This tool has been essential for maintaining concentration during long study sessions.",
    rating: 5,
    avatar: "MG",
    verified: true,
    gradient: "from-amber-500 to-orange-500"
  },
  {
    name: "Tom Anderson",
    role: "Developer",
    content: "The best productivity tool I've used. Simple, effective, and doesn't get in the way of my work.",
    rating: 5,
    avatar: "TA",
    verified: true,
    gradient: "from-violet-500 to-purple-500"
  }
]

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20 shadow-lg">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Why people love <span className="gradient-text font-extrabold drop-shadow-lg">Centra</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto drop-shadow-md">
            Join our community of users who have transformed their productivity
          </p>
        </motion.div>

        {/* Scrolling Testimonials */}
        <div className="relative mt-6 max-h-[650px] overflow-hidden">
          <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-3">
            {/* Column 1 - 30s duration */}
            <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-col animate-scroll-up-1">
              {/* Duplicate testimonials for seamless loop */}
              {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((testimonial, index) => (
                <motion.div 
                  key={index} 
                  className="testimonial-card bg-[#2a2a2a] rounded-xl p-6 shadow-soft hover:shadow-strong transition-all duration-300 mb-4 border border-[#3a3a3a]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Content */}
                  <p className="text-gray-200 leading-relaxed mb-6 text-sm">
                    "{testimonial.content}"
                  </p>

                  {/* Rating and Verified Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <motion.div 
                        className="flex items-center space-x-1 text-xs text-green-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified review</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <div>
                      <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-gray-300 text-xs">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Column 2 - 20s duration */}
            <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-col animate-scroll-up-2">
              {/* Duplicate testimonials for seamless loop */}
              {[...testimonials.slice(3, 6), ...testimonials.slice(3, 6)].map((testimonial, index) => (
                <motion.div 
                  key={index} 
                  className="testimonial-card bg-[#2a2a2a] rounded-xl p-6 shadow-soft hover:shadow-strong transition-all duration-300 mb-4 border border-[#3a3a3a]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Content */}
                  <p className="text-gray-200 leading-relaxed mb-6 text-sm">
                    "{testimonial.content}"
                  </p>

                  {/* Rating and Verified Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <motion.div 
                        className="flex items-center space-x-1 text-xs text-green-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified review</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <div>
                      <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-gray-300 text-xs">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Column 3 - 30s duration */}
            <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-col animate-scroll-up-3">
              {/* Duplicate testimonials for seamless loop */}
              {[...testimonials.slice(6, 9), ...testimonials.slice(6, 9)].map((testimonial, index) => (
                <motion.div 
                  key={index} 
                  className="testimonial-card bg-[#2a2a2a] rounded-xl p-6 shadow-soft hover:shadow-strong transition-all duration-300 mb-4 border border-[#3a3a3a]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -4,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Content */}
                  <p className="text-gray-200 leading-relaxed mb-6 text-sm">
                    "{testimonial.content}"
                  </p>

                  {/* Rating and Verified Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    {testimonial.verified && (
                      <motion.div 
                        className="flex items-center space-x-1 text-xs text-green-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified review</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <div>
                      <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-gray-300 text-xs">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Fade Effects - Updated for dark charcoal theme */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent"></div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent"></div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
