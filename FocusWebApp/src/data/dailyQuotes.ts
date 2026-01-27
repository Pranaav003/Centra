export interface DailyQuote {
  id: number;
  text: string;
  author: string;
  category: 'productivity' | 'focus' | 'motivation' | 'success' | 'wisdom';
}

export const dailyQuotes: DailyQuote[] = [
  // Productivity Quotes
  { id: 1, text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "productivity" },
  { id: 2, text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.", author: "Paul J. Meyer", category: "productivity" },
  { id: 3, text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain", category: "productivity" },
  { id: 4, text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "productivity" },
  { id: 5, text: "The future depends on what you do today.", author: "Mahatma Gandhi", category: "productivity" },
  
  // Focus Quotes
  { id: 6, text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell", category: "focus" },
  { id: 7, text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "focus" },
  { id: 8, text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack", category: "focus" },
  { id: 9, text: "Where focus goes, energy flows.", author: "Tony Robbins", category: "focus" },
  { id: 10, text: "The key to success is to focus on goals, not obstacles.", author: "Unknown", category: "focus" },
  
  // Motivation Quotes
  { id: 11, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
  { id: 12, text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "motivation" },
  { id: 13, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "motivation" },
  { id: 14, text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
  { id: 15, text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "motivation" },
  
  // Success Quotes
  { id: 16, text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "success" },
  { id: 17, text: "The road to success and the road to failure are almost exactly the same.", author: "Colin Davis", category: "success" },
  { id: 18, text: "Success is not the key to happiness. Happiness is the key to success.", author: "Herman Cain", category: "success" },
  { id: 19, text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "success" },
  { id: 20, text: "Success is not in what you have, but who you are.", author: "Bo Bennett", category: "success" },
  
  // Wisdom Quotes
  { id: 21, text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "wisdom" },
  { id: 22, text: "Wisdom comes from experience, and experience comes from mistakes.", author: "Unknown", category: "wisdom" },
  { id: 23, text: "The more you learn, the more you realize how much you don't know.", author: "Albert Einstein", category: "wisdom" },
  { id: 24, text: "Knowledge speaks, but wisdom listens.", author: "Jimi Hendrix", category: "wisdom" },
  { id: 25, text: "Wisdom is the reward you get for a lifetime of listening when you'd have preferred to talk.", author: "Doug Larson", category: "wisdom" },
  
  // More Productivity Quotes
  { id: 26, text: "Efficiency is doing things right; effectiveness is doing the right things.", author: "Peter Drucker", category: "productivity" },
  { id: 27, text: "Time is more valuable than money. You can get more money, but you cannot get more time.", author: "Jim Rohn", category: "productivity" },
  { id: 28, text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "productivity" },
  { id: 29, text: "Don't say you don't have enough time. You have exactly the same number of hours per day that were given to Helen Keller, Pasteur, Michelangelo, Mother Teresa, Leonardo da Vinci, Thomas Jefferson, and Albert Einstein.", author: "H. Jackson Brown Jr.", category: "productivity" },
  { id: 30, text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "productivity" },
  
  // More Focus Quotes
  { id: 31, text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee", category: "focus" },
  { id: 32, text: "The difference between successful people and really successful people is that really successful people say no to almost everything.", author: "Warren Buffett", category: "focus" },
  { id: 33, text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "focus" },
  { id: 34, text: "Multitasking is the ability to screw up everything simultaneously.", author: "Unknown", category: "focus" },
  { id: 35, text: "The first wealth is health.", author: "Ralph Waldo Emerson", category: "focus" },
  
  // More Motivation Quotes
  { id: 36, text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar", category: "motivation" },
  { id: 37, text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "motivation" },
  { id: 38, text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "motivation" },
  { id: 39, text: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "motivation" },
  { id: 40, text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis", category: "motivation" },
  
  // More Success Quotes
  { id: 41, text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau", category: "success" },
  { id: 42, text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon", category: "success" },
  { id: 43, text: "Success is not just about making money. It's about making a difference.", author: "Unknown", category: "success" },
  { id: 44, text: "The biggest risk is not taking any risk. In a world that's changing quickly, the only strategy that is guaranteed to fail is not taking risks.", author: "Mark Zuckerberg", category: "success" },
  { id: 45, text: "Success is going from failure to failure without losing your enthusiasm.", author: "Winston Churchill", category: "success" },
  
  // More Wisdom Quotes
  { id: 46, text: "The fool doth think he is wise, but the wise man knows himself to be a fool.", author: "William Shakespeare", category: "wisdom" },
  { id: 47, text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "wisdom" },
  { id: 48, text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "wisdom" },
  { id: 49, text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "wisdom" },
  { id: 50, text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu", category: "wisdom" },
  
  // Additional Productivity Quotes
  { id: 51, text: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "productivity" },
  { id: 52, text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "productivity" },
  { id: 53, text: "The only bad workout is the one that didn't happen.", author: "Unknown", category: "productivity" },
  { id: 54, text: "Small progress is still progress.", author: "Unknown", category: "productivity" },
  { id: 55, text: "Done is better than perfect.", author: "Sheryl Sandberg", category: "productivity" },
  
  // Additional Focus Quotes
  { id: 56, text: "The mind is everything. What you think you become.", author: "Buddha", category: "focus" },
  { id: 57, text: "Quality is not an act, it is a habit.", author: "Aristotle", category: "focus" },
  { id: 58, text: "The more you focus on the past or future, the more you miss in the reality.", author: "Unknown", category: "focus" },
  { id: 59, text: "Focus on the present moment, not the past or future.", author: "Unknown", category: "focus" },
  { id: 60, text: "The key to success is to focus on goals, not obstacles.", author: "Unknown", category: "focus" },
  
  // Additional Motivation Quotes
  { id: 61, text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", category: "motivation" },
  { id: 62, text: "Don't count the days, make the days count.", author: "Muhammad Ali", category: "motivation" },
  { id: 63, text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", category: "motivation" },
  { id: 64, text: "Dream big and dare to fail.", author: "Norman Vaughan", category: "motivation" },
  { id: 65, text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh", category: "motivation" },
  
  // Additional Success Quotes
  { id: 66, text: "Success is not about the destination, it's about the journey.", author: "Unknown", category: "success" },
  { id: 67, text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson", category: "success" },
  { id: 68, text: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "success" },
  { id: 69, text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "success" },
  { id: 70, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
  
  // Additional Wisdom Quotes
  { id: 71, text: "The greatest wealth is to live content with little.", author: "Plato", category: "wisdom" },
  { id: 72, text: "The unexamined life is not worth living.", author: "Socrates", category: "wisdom" },
  { id: 73, text: "Wisdom begins in wonder.", author: "Socrates", category: "wisdom" },
  { id: 74, text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "wisdom" },
  { id: 75, text: "Knowledge speaks, but wisdom listens.", author: "Jimi Hendrix", category: "wisdom" },
  
  // Final Productivity Quotes
  { id: 76, text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr.", category: "productivity" },
  { id: 77, text: "Don't wait. The time will never be just right.", author: "Napoleon Hill", category: "productivity" },
  { id: 78, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "productivity" },
  { id: 79, text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "productivity" },
  { id: 80, text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "productivity" },
  
  // Final Focus Quotes
  { id: 81, text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell", category: "focus" },
  { id: 82, text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "focus" },
  { id: 83, text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack", category: "focus" },
  { id: 84, text: "Where focus goes, energy flows.", author: "Tony Robbins", category: "focus" },
  { id: 85, text: "The key to success is to focus on goals, not obstacles.", author: "Unknown", category: "focus" },
  
  // Final Motivation Quotes
  { id: 86, text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
  { id: 87, text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "motivation" },
  { id: 88, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "motivation" },
  { id: 89, text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
  { id: 90, text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "motivation" },
  
  // Final Success Quotes
  { id: 91, text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "success" },
  { id: 92, text: "The road to success and the road to failure are almost exactly the same.", author: "Colin Davis", category: "success" },
  { id: 93, text: "Success is not the key to happiness. Happiness is the key to success.", author: "Herman Cain", category: "success" },
  { id: 94, text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "success" },
  { id: 95, text: "Success is not in what you have, but who you are.", author: "Bo Bennett", category: "success" },
  
  // Final Wisdom Quotes
  { id: 96, text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "wisdom" },
  { id: 97, text: "Wisdom comes from experience, and experience comes from mistakes.", author: "Unknown", category: "wisdom" },
  { id: 98, text: "The more you learn, the more you realize how much you don't know.", author: "Albert Einstein", category: "wisdom" },
  { id: 99, text: "Knowledge speaks, but wisdom listens.", author: "Jimi Hendrix", category: "wisdom" },
  { id: 100, text: "Wisdom is the reward you get for a lifetime of listening when you'd have preferred to talk.", author: "Doug Larson", category: "wisdom" }
];

// Function to get today's quote based on the current date
export const getTodaysQuote = (): DailyQuote => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % dailyQuotes.length;
  return dailyQuotes[quoteIndex];
};

// Function to get a random quote
export const getRandomQuote = (): DailyQuote => {
  const randomIndex = Math.floor(Math.random() * dailyQuotes.length);
  return dailyQuotes[randomIndex];
};

// Function to get quotes by category
export const getQuotesByCategory = (category: DailyQuote['category']): DailyQuote[] => {
  return dailyQuotes.filter(quote => quote.category === category);
};

// Function to test the quote system
export const testQuoteSystem = () => {
  console.log('=== Daily Quote System Test ===');
  console.log('Total quotes available:', dailyQuotes.length);
  console.log('Today\'s quote:', getTodaysQuote());
  console.log('Random quote:', getRandomQuote());
  console.log('Productivity quotes:', getQuotesByCategory('productivity').length);
  console.log('Focus quotes:', getQuotesByCategory('focus').length);
  console.log('Motivation quotes:', getQuotesByCategory('motivation').length);
  console.log('Success quotes:', getQuotesByCategory('success').length);
  console.log('Wisdom quotes:', getQuotesByCategory('wisdom').length);
  
  // Test different days
  for (let i = 0; i < 5; i++) {
    const testDate = new Date(2024, 0, i + 1); // January 1-5, 2024
    const dayOfYear = Math.floor((testDate.getTime() - new Date(testDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % dailyQuotes.length;
    console.log(`Day ${i + 1} quote index: ${quoteIndex} - "${dailyQuotes[quoteIndex].text}"`);
  }
};
