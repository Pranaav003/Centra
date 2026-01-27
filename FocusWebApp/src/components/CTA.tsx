import React from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const benefits = [
  "Block <strong>distracting websites</strong> completely",
  "Password-protected <strong>focus mode</strong>",
  "<strong>Deep Work Manager</strong> with AI insights",
  "<strong>Unlimited page blocks</strong> for Pro users",
  "Core blocker is <strong>free forever</strong>",
  "<strong>Pro features</strong> give you more power"
]

const CTA: React.FC = () => {
  return (
    <section id="cta" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="text-center p-8 md:p-12 border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300">
            {/* Main CTA */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                Ready to <span className="gradient-text font-extrabold drop-shadow-lg">boost your productivity</span>?
              </h2>
              <p className="text-lg text-gray-300 mb-8 drop-shadow-md">
                Join thousands of users who have <span className="font-semibold text-primary">transformed their focus</span>
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 drop-shadow-sm" />
                  <span className="drop-shadow-sm" dangerouslySetInnerHTML={{ __html: benefit }} />
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-primary/25 transition-all duration-300 animate-gradient-bg bg-[length:200%_200%]">
                <Shield className="w-5 h-5 mr-2" />
                Add to Browser
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
