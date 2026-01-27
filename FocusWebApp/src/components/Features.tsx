import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

// 1) SOURCE OF TRUTH — edit here to add/change features
const FEATURES = [
  // FREE FEATURES (top)
  {
    id: "free-forever",
    title: "Base Web Blocker",
    short: "Free forever",
    long:
      "The core blocker is free forever. No account required to get started. Toggle focus mode, and add up to 5 sites (unlimited with Pro).",
    tier: "free",
    icon: "🛡️",
  },
  {
    id: "password-toggle",
    title: "Password-protected toggle",
    short: "Prevent quick unblocks",
    long:
      "Set a password/PIN so you can't impulsively disable blocking. Great for keeping commitments during deep work.",
    tier: "free",
    icon: "🔒",
  },
  {
    id: "stats",
    title: "Focus Stats",
    short: "Track hours in focus mode",
    long:
      "See how long you've stayed in focus mode, daily/weekly streaks, and trends to keep you motivated.",
    tier: "free",
    icon: "📈",
  },
  // PRO FEATURES (bottom)
  {
    id: "deep-work-manager",
    title: "Deep Work Manager",
    short: "AI-assisted focus analytics",
    long:
      "Get AI-powered insights into your distraction patterns. See where you're getting distracted, what times you're most vulnerable, and receive personalized recommendations to improve your focus. Track your productivity trends and optimize your workflow.",
    tier: "pro",
    icon: "🧠",
  },
  {
    id: "unlimited-blocks",
    title: "Unlimited Page Blocks",
    short: "Block as many sites as you need",
    long:
      "Free users can block up to 5 sites. Pro users get unlimited site blocking—add as many distracting websites as you need to maintain perfect focus.",
    tier: "pro",
    icon: "🚫",
  },
  {
    id: "redirect",
    title: "Motivational Redirect Page",
    short: "Refocus instead of doomscroll",
    long:
      "When you hit a blocked site, get redirected to a calming page to help you recenter and refocus.",
    tier: "pro",
    icon: "🎯",
  },
];

// 2) Small helpers
const TierBadge = ({ tier }: { tier: string }) => {
  const isPro = tier === "pro";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
        ${isPro ? "bg-gradient-to-r from-fuchsia-500 to-amber-400 text-black animate-gradient-bg bg-[length:200%_200%]" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"}
      `}
      aria-label={isPro ? "Pro feature" : "Free feature"}
    >
      {isPro ? "Pro" : "Free"}
    </span>
  );
};

const Features: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'free' | 'pro'>('free');
  const openFeature = FEATURES.find(f => f.id === openId);

  // Separate free and pro features
  const freeFeatures = FEATURES.filter(f => f.tier === "free");
  const proFeatures = FEATURES.filter(f => f.tier === "pro");

  return (
    <section
      id="features"
      className="relative mx-auto max-w-6xl px-4 py-16 text-slate-100"
      aria-labelledby="features-heading"
    >
      {/* Header */}
      <motion.div 
        className="mx-auto max-w-3xl text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Badge variant="secondary" className="mb-4 bg-white/5 text-slate-300 border-white/10 ring-1 ring-white/10">Features</Badge>
        <h2
          id="features-heading"
          className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          Why <span className="bg-gradient-to-r from-rose-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">Centra</span>?
        </h2>
        <p className="mt-3 text-slate-300/90">
          The essentials are <strong>free forever</strong>—upgrade only if you want more power.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div 
        className="mt-10 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 gap-2">
          <button
            onClick={() => setActiveTab('free')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'free'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-lg'
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            Free Features
          </button>
          <button
            onClick={() => setActiveTab('pro')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'pro'
                ? 'bg-gradient-to-r from-fuchsia-500/20 to-amber-400/20 text-fuchsia-300 border border-fuchsia-400/30 shadow-lg animate-gradient-bg bg-[length:200%_200%]'
                : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            Pro Features
          </button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        className="mt-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'free' ? (
            <motion.div
              key="free"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold text-emerald-300 mb-6">Free Features</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {freeFeatures.map((f, index) => (
                  <motion.button
                    key={f.id}
                    onClick={() => setOpenId(f.id)}
                    className={`group relative w-full rounded-2xl border p-5 text-left outline-none transition
                               hover:shadow-lg hover:shadow-black/30 focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 ${
                                 f.id === "free-forever" 
                                   ? "border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/15 ring-1 ring-emerald-400/30" 
                                   : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                               }`}
                    aria-haspopup="dialog"
                    aria-controls={`feature-modal-${f.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl text-xl ${
                        f.id === "free-forever"
                          ? "bg-emerald-500/20 ring-1 ring-emerald-400/40"
                          : "bg-white/5 ring-1 ring-white/10"
                      }`}>
                        <span aria-hidden="true">{f.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-base font-semibold ${
                            f.id === "free-forever" ? "text-emerald-100" : "text-white"
                          }`}>{f.title}</h3>
                          <TierBadge tier={f.tier} />
                        </div>
                        <p className={`mt-1 text-sm ${
                          f.id === "free-forever" ? "text-emerald-200/90" : "text-slate-300/90"
                        }`}>{f.short}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pro"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-fuchsia-400 to-amber-400 bg-clip-text mb-6 animate-gradient bg-[length:200%_200%]">Pro Features</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {proFeatures.map((f, index) => (
                  <motion.button
                    key={f.id}
                    onClick={() => setOpenId(f.id)}
                    className="group relative w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left outline-none transition
                               hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/30 focus-visible:ring-2 focus-visible:ring-fuchsia-400/60"
                    aria-haspopup="dialog"
                    aria-controls={`feature-modal-${f.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 text-xl">
                        <span aria-hidden="true">{f.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-white">{f.title}</h3>
                          <TierBadge tier={f.tier} />
                        </div>
                        <p className="mt-1 text-sm text-slate-300/90">{f.short}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {openFeature && (
          <motion.div
            role="dialog"
            aria-modal="true"
            id={`feature-modal-${openFeature.id}`}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
            onClick={() => setOpenId(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111213] p-6 text-left shadow-2xl ring-1 ring-white/5"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 text-xl">
                    <span aria-hidden="true">{openFeature.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{openFeature.title}</h3>
                </div>
                <TierBadge tier={openFeature.tier} />
              </div>

              <p className="mt-3 text-slate-300/95">{openFeature.long}</p>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {openFeature.tier === "free"
                    ? "Included in the free plan."
                    : "Available with Pro. The base blocker remains free."}
                </p>
                <button
                  onClick={() => setOpenId(null)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Features
