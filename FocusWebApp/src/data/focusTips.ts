export interface FocusTip {
  id: number;
  text: string;
  icon: string;
  category: 'password' | 'blocking' | 'sessions' | 'analytics' | 'general';
}

export const focusTips: FocusTip[] = [
  {
    id: 1,
    text: "Set a password in Privacy Settings to make turning off the website blocker harder and maintain your focus commitment.",
    icon: "🔒",
    category: 'password'
  },
  {
    id: 2,
    text: "Block your most distracting sites first - start with social media, then add entertainment sites as needed.",
    icon: "🚫",
    category: 'blocking'
  },
  {
    id: 3,
    text: "Create focus sessions with specific goals to track your productivity and build better habits over time.",
    icon: "⏱️",
    category: 'sessions'
  },
  {
    id: 4,
    text: "Check your Analytics tab to see when you're most distracted and schedule blocking during those vulnerable hours.",
    icon: "📊",
    category: 'analytics'
  },
  {
    id: 5,
    text: "Use scheduled blocking to automatically block sites during your work hours - set it and forget it!",
    icon: "📅",
    category: 'blocking'
  },
  {
    id: 6,
    text: "Enable blocking before starting a focus session to prevent distractions from the moment you begin.",
    icon: "🎯",
    category: 'sessions'
  },
  {
    id: 7,
    text: "Review your blocked history to see which sites you tried to visit - this helps identify your biggest distractions.",
    icon: "📝",
    category: 'analytics'
  },
  {
    id: 8,
    text: "Start with shorter focus sessions (25 minutes) and gradually increase duration as you build focus stamina.",
    icon: "💪",
    category: 'sessions'
  },
  {
    id: 9,
    text: "Use the redirect page feature to redirect blocked sites to a calming page that helps you refocus.",
    icon: "🔄",
    category: 'blocking'
  },
  {
    id: 10,
    text: "Password protection prevents impulsive unblocking - perfect for maintaining focus during important work periods.",
    icon: "🛡️",
    category: 'password'
  },
  {
    id: 11,
    text: "Track your focus streaks in Analytics to stay motivated and build consistency in your productivity habits.",
    icon: "🔥",
    category: 'analytics'
  },
  {
    id: 12,
    text: "Block sites proactively before you need to - don't wait until you're already distracted to add them.",
    icon: "⚡",
    category: 'blocking'
  },
  {
    id: 13,
    text: "Use the Deep Work Manager to get AI-powered insights about your distraction patterns and optimize your workflow.",
    icon: "🧠",
    category: 'analytics'
  },
  {
    id: 14,
    text: "Set realistic session goals - completing shorter sessions consistently is better than failing at long ones.",
    icon: "✅",
    category: 'sessions'
  },
  {
    id: 15,
    text: "Remember: the password you set protects your focus commitment - choose something meaningful but not too easy to guess.",
    icon: "🔐",
    category: 'password'
  }
];

// Function to get today's tip based on the current date
export const getTodaysTip = (): FocusTip => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const tipIndex = dayOfYear % focusTips.length;
  return focusTips[tipIndex];
};

// Function to get a random tip
export const getRandomTip = (): FocusTip => {
  const randomIndex = Math.floor(Math.random() * focusTips.length);
  return focusTips[randomIndex];
};

// Function to get tips by category
export const getTipsByCategory = (category: FocusTip['category']): FocusTip[] => {
  return focusTips.filter(tip => tip.category === category);
};
