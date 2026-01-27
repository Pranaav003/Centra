import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  Eye, 
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Coffee,
  Moon,
  Sun,
  Smartphone,
  Laptop,
  Award,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Flame,
  Timer,
  Focus
} from 'lucide-react';

interface FocusSession {
  _id: string;
  title: string;
  description: string;
  goal: number;
  startTime: string;
  endTime?: string;
  completedTime?: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'interrupted' | 'abandoned';
}

interface AnalyticsData {
  focusScore: number;
  productivityTrend: 'up' | 'down' | 'stable';
  burnoutRisk: 'low' | 'medium' | 'high';
  optimalHours: number[];
  heatmapData: number[];
  timeLabels: string[];
  distractionPatterns: {
    peakHours: number[];
    commonSites: string[];
    sessionBreaks: number;
  };
  insights: string[];
  recommendations: string[];
}

interface AnalyticsPageProps {
  sessions: FocusSession[];
  blockedSites: string[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ sessions, blockedSites }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    focusScore: 0,
    productivityTrend: 'stable',
    burnoutRisk: 'low',
    optimalHours: [],
    heatmapData: Array(24).fill(0),
    timeLabels: [],
    distractionPatterns: {
      peakHours: [],
      commonSites: [],
      sessionBreaks: 0
    },
    insights: [],
    recommendations: []
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Process sessions data to generate analytics
  useEffect(() => {
    const processAnalytics = () => {
      const now = new Date();
      const daysAgo = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      // Get blocked history from localStorage
      const blockedHistory = JSON.parse(localStorage.getItem('blockedHistory') || '[]');
      
      // Filter sessions by timeframe
      const recentSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= startDate;
      });
      
      // Analyze distraction patterns from blocked history
      const distractionHours: { [key: number]: number } = {};
      const distractionSites: { [key: string]: { count: number; lastVisited: string } } = {};
      
      blockedHistory.forEach((entry: any) => {
        if (entry.timestamp) {
          const visitDate = new Date(entry.timestamp);
          if (visitDate >= startDate) {
            // Track distraction hours
            const hour = visitDate.getHours();
            distractionHours[hour] = (distractionHours[hour] || 0) + (entry.visits || 1);
            
            // Track distraction sites
            if (entry.site) {
              if (!distractionSites[entry.site]) {
                distractionSites[entry.site] = { count: 0, lastVisited: entry.timestamp };
              }
              distractionSites[entry.site].count += (entry.visits || 1);
              if (entry.lastVisited && new Date(entry.lastVisited) > new Date(distractionSites[entry.site].lastVisited)) {
                distractionSites[entry.site].lastVisited = entry.lastVisited;
              }
            }
          }
        }
      });
      
      // Get peak distraction hours (top 3)
      const peakDistractionHours = Object.entries(distractionHours)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));
      
      // Get top distracting sites (sorted by visit count)
      const topDistractingSites = Object.entries(distractionSites)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5)
        .map(([site]) => site);

      // Calculate completion rate
      const completedSessions = recentSessions.filter(s => s.status === 'completed');
      const completionRate = recentSessions.length > 0 ? (completedSessions.length / recentSessions.length) * 100 : 0;

      // Calculate average session duration
      const sessionsWithDuration = completedSessions.filter(s => s.completedTime);
      const avgDuration = sessionsWithDuration.length > 0 
        ? sessionsWithDuration.reduce((sum, s) => sum + (s.completedTime || 0), 0) / sessionsWithDuration.length
        : 0;

      // Analyze optimal hours and heatmap data
      const hourCounts: { [key: number]: number } = {};
      completedSessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const optimalHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      // Generate heatmap data based on timeframe
      let heatmapData: number[] = [];
      let timeLabels: string[] = [];
      
      if (selectedTimeframe === '7d') {
        // 7 days - show each day with 4-hour blocks (6 blocks per day = 42 total)
        heatmapData = Array(42).fill(0);
        timeLabels = [];
        for (let day = 0; day < 7; day++) {
          for (let block = 0; block < 6; block++) {
            const hour = block * 4;
            timeLabels.push(`${day === 0 ? 'Mon' : day === 1 ? 'Tue' : day === 2 ? 'Wed' : day === 3 ? 'Thu' : day === 4 ? 'Fri' : day === 5 ? 'Sat' : 'Sun'} ${hour}:00`);
          }
        }
        
        const blockCounts: { [key: number]: number } = {};
        completedSessions.forEach(session => {
          const sessionDate = new Date(session.startTime);
          const dayOfWeek = sessionDate.getDay();
          const hour = sessionDate.getHours();
          const blockIndex = Math.floor(hour / 4) + (dayOfWeek * 6);
          blockCounts[blockIndex] = (blockCounts[blockIndex] || 0) + 1;
        });
        
        const maxSessions = Math.max(...Object.values(blockCounts), 1);
        for (let i = 0; i < 42; i++) {
          const sessionCount = blockCounts[i] || 0;
          heatmapData[i] = sessionCount / maxSessions;
        }
      } else if (selectedTimeframe === '30d') {
        // 30 days - show each day (30 blocks)
        heatmapData = Array(30).fill(0);
        timeLabels = [];
        for (let day = 0; day < 30; day++) {
          timeLabels.push(`Day ${day + 1}`);
        }
        
        const dayCounts: { [key: number]: number } = {};
        completedSessions.forEach(session => {
          const sessionDate = new Date(session.startTime);
          const daysSinceStart = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceStart >= 0 && daysSinceStart < 30) {
            const dayIndex = 29 - daysSinceStart; // Reverse order (most recent first)
            dayCounts[dayIndex] = (dayCounts[dayIndex] || 0) + 1;
          }
        });
        
        const maxSessions = Math.max(...Object.values(dayCounts), 1);
        for (let i = 0; i < 30; i++) {
          const sessionCount = dayCounts[i] || 0;
          heatmapData[i] = sessionCount / maxSessions;
        }
      } else {
        // 90 days - show each week (13 weeks = 13 blocks)
        heatmapData = Array(13).fill(0);
        timeLabels = [];
        for (let week = 0; week < 13; week++) {
          timeLabels.push(`Week ${week + 1}`);
        }
        
        const weekCounts: { [key: number]: number } = {};
        completedSessions.forEach(session => {
          const sessionDate = new Date(session.startTime);
          const weeksSinceStart = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          if (weeksSinceStart >= 0 && weeksSinceStart < 13) {
            const weekIndex = 12 - weeksSinceStart; // Reverse order (most recent first)
            weekCounts[weekIndex] = (weekCounts[weekIndex] || 0) + 1;
          }
        });
        
        const maxSessions = Math.max(...Object.values(weekCounts), 1);
        for (let i = 0; i < 13; i++) {
          const sessionCount = weekCounts[i] || 0;
          heatmapData[i] = sessionCount / maxSessions;
        }
      }

      // Calculate focus score based on completion rate and average duration
      const focusScore = Math.min(100, Math.round((completionRate * 0.6) + (Math.min(avgDuration / 60, 2) * 20)));

      // Determine productivity trend
      const lastWeek = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      });
      const previousWeek = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= twoWeeksAgo && sessionDate < weekAgo;
      });

      const lastWeekCompletion = lastWeek.filter(s => s.status === 'completed').length;
      const previousWeekCompletion = previousWeek.filter(s => s.status === 'completed').length;
      
      let productivityTrend: 'up' | 'down' | 'stable' = 'stable';
      if (lastWeekCompletion > previousWeekCompletion) productivityTrend = 'up';
      else if (lastWeekCompletion < previousWeekCompletion) productivityTrend = 'down';

      // Calculate burnout risk based on session frequency and completion
      let burnoutRisk: 'low' | 'medium' | 'high' = 'low';
      if (recentSessions.length === 0) {
        // No recent activity - low risk
        burnoutRisk = 'low';
      } else {
        const dailySessions = recentSessions.length / daysAgo;
        if (dailySessions > 5 || completionRate < 50) burnoutRisk = 'high';
        else if (dailySessions > 3 || completionRate < 70) burnoutRisk = 'medium';
      }

      // Generate insights based on real data
      const insights: string[] = [];
      if (recentSessions.length === 0) {
        insights.push("No focus sessions recorded in the selected timeframe.");
        insights.push("Start your first session to begin tracking your productivity patterns.");
        insights.push("Try setting a 25-minute timer for your next focused work period.");
      } else {
        if (optimalHours.length > 0) {
          insights.push(`Your most productive hours are ${optimalHours.map(h => `${h}:00`).join(', ')}`);
        }
        if (completionRate > 80) {
          insights.push("Excellent session completion rate! You're maintaining great focus consistency.");
        } else if (completionRate < 50 && recentSessions.length > 0) {
          insights.push("Consider breaking down tasks into smaller, more manageable sessions.");
        }
        if (avgDuration > 60) {
          insights.push(`Your average session duration is ${Math.round(avgDuration)} minutes - great endurance!`);
        }
        insights.push(`You've completed ${completedSessions.length} focus sessions in the last ${daysAgo} days.`);
      }
      
      // Add distraction insights
      if (peakDistractionHours.length > 0) {
        insights.push(`Peak distraction times: ${peakDistractionHours.map(h => `${h}:00`).join(', ')} - consider extra blocking during these hours.`);
      }
      if (topDistractingSites.length > 0) {
        insights.push(`Most distracting sites: ${topDistractingSites.slice(0, 3).join(', ')} - keep these blocked for better focus.`);
      }
      if (Object.keys(distractionSites).length > 0) {
        const totalDistractions = Object.values(distractionSites).reduce((sum, site) => sum + site.count, 0);
        insights.push(`You've been blocked from ${totalDistractions} distraction attempt${totalDistractions !== 1 ? 's' : ''} in the last ${daysAgo} days.`);
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (recentSessions.length === 0) {
        recommendations.push("Start with a 25-minute focus session to establish a routine.");
        recommendations.push("Block distracting websites before beginning your session.");
        recommendations.push("Set a specific goal for each focus session to maintain motivation.");
        recommendations.push("Use the schedule blocking feature to create dedicated focus time.");
      } else {
        if (optimalHours.length > 0) {
          recommendations.push(`Schedule your most important tasks during ${optimalHours[0]}:00 - your peak hour.`);
        }
        if (avgDuration < 25) {
          recommendations.push("Try the Pomodoro technique with 25-minute focused intervals.");
        }
        if (burnoutRisk === 'high') {
          recommendations.push("Take regular breaks and consider reducing session frequency to prevent burnout.");
        }
        if (blockedSites.length > 0) {
          recommendations.push(`You're blocking ${blockedSites.length} distracting sites - great job!`);
        }
        recommendations.push("Track your progress daily to maintain motivation and consistency.");
      }
      
      // Add distraction-based recommendations
      if (peakDistractionHours.length > 0) {
        const peakHour = peakDistractionHours[0];
        recommendations.push(`Set up scheduled blocking during ${peakHour}:00-${peakHour + 1}:00 to prevent distractions at your peak vulnerability time.`);
      }
      if (topDistractingSites.length > 0 && !blockedSites.includes(topDistractingSites[0])) {
        recommendations.push(`Consider blocking ${topDistractingSites[0]} - it's one of your most visited distracting sites.`);
      }
      if (Object.keys(distractionSites).length > 5) {
        recommendations.push("You're blocking many different sites - great! Consider using schedule blocking for sites you only visit at specific times.");
      }
      if (peakDistractionHours.length > 0 && optimalHours.length > 0) {
        const distractionHour = peakDistractionHours[0];
        const focusHour = optimalHours[0];
        if (Math.abs(distractionHour - focusHour) < 2) {
          recommendations.push("Your peak distraction time is close to your peak focus time - use extra willpower or schedule blocking during this window.");
        }
      }

      setAnalyticsData({
        focusScore,
        productivityTrend,
        burnoutRisk,
        optimalHours,
        heatmapData,
        timeLabels,
        distractionPatterns: {
          peakHours: peakDistractionHours,
          commonSites: topDistractingSites.length > 0 ? topDistractingSites : blockedSites.slice(0, 3),
          sessionBreaks: Math.round(avgDuration)
        },
        insights,
        recommendations
      });
    };

    processAnalytics();
  }, [sessions, blockedSites, selectedTimeframe]);
  
  // Function to generate AI insights (placeholder for future AI integration)
  const generateAIInsights = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Insights are already generated in processAnalytics
    }, 1500);
  };

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Focus Analytics
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Advanced AI-powered insights to optimize your productivity and prevent burnout
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-1">
            {(['7d', '30d', '90d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeframe === timeframe
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          
          {/* Focus Score */}
          <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-6 relative cursor-help">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                {getTrendIcon(analyticsData.productivityTrend)}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{analyticsData.focusScore}%</div>
              <div className="text-gray-400 text-sm">Focus Score</div>
              <div className="mt-3 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analyticsData.focusScore}%` }}
                ></div>
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 w-64">
              <div className="font-semibold mb-1">Focus Score Calculation:</div>
              <div>• 60% based on session completion rate</div>
              <div>• 40% based on average session duration</div>
              <div className="text-gray-300 mt-1">Higher completion + longer sessions = better score</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Burnout Risk */}
          <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-6 relative cursor-help">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div className={`text-3xl font-bold mb-1 capitalize ${getBurnoutColor(analyticsData.burnoutRisk).split(' ')[0]}`}>
                {analyticsData.burnoutRisk}
              </div>
              <div className="text-gray-400 text-sm">Burnout Risk</div>
              <div className="mt-3 flex items-center space-x-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      analyticsData.burnoutRisk === 'low' ? 'bg-green-500' :
                      analyticsData.burnoutRisk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: analyticsData.burnoutRisk === 'low' ? '25%' : analyticsData.burnoutRisk === 'medium' ? '60%' : '85%' }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400">
                  {analyticsData.burnoutRisk === 'low' ? '25%' : analyticsData.burnoutRisk === 'medium' ? '60%' : '85%'}
                </span>
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 w-64">
              <div className="font-semibold mb-1">Burnout Risk Assessment:</div>
              <div>• Based on daily session frequency</div>
              <div>• Considers completion rate</div>
              <div className="text-gray-300 mt-1">High: 5+ sessions/day or &lt;50% completion</div>
              <div className="text-gray-300">Medium: 3+ sessions/day or &lt;70% completion</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Peak Focus Hours */}
          <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-6 relative cursor-help">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <Sun className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {analyticsData.optimalHours.length}
              </div>
              <div className="text-gray-400 text-sm">Peak Focus Hours</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {analyticsData.optimalHours.length > 0 ? (
                  <>
                    {analyticsData.optimalHours.slice(0, 3).map((hour, index) => (
                      <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        {hour}:00
                      </span>
                    ))}
                    {analyticsData.optimalHours.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded">
                        +{analyticsData.optimalHours.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500 text-xs">No data yet</span>
                )}
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 w-64">
              <div className="font-semibold mb-1">Peak Focus Hours:</div>
              <div>• Analyzes completed session start times</div>
              <div>• Shows hours with most successful sessions</div>
              <div className="text-gray-300 mt-1">Schedule important tasks during these hours</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          
          {/* Peak Distraction Times */}
          <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-6 relative cursor-help">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <Moon className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {analyticsData.distractionPatterns.peakHours.length}
              </div>
              <div className="text-gray-400 text-sm">Peak Distraction Times</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {analyticsData.distractionPatterns.peakHours.length > 0 ? (
                  <>
                    {analyticsData.distractionPatterns.peakHours.slice(0, 3).map((hour, index) => (
                      <span key={index} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        {hour}:00
                      </span>
                    ))}
                    {analyticsData.distractionPatterns.peakHours.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded">
                        +{analyticsData.distractionPatterns.peakHours.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500 text-xs">No distractions yet</span>
                )}
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 w-64">
              <div className="font-semibold mb-1">Peak Distraction Times:</div>
              <div>• Analyzes when you attempt to visit blocked sites</div>
              <div>• Shows hours when you're most vulnerable to distractions</div>
              <div className="text-gray-300 mt-1">Use scheduled blocking during these hours</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* Session Breaks */}
          <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-6 relative cursor-help">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Timer className="w-5 h-5 text-blue-400" />
                </div>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {analyticsData.distractionPatterns.sessionBreaks}
              </div>
              <div className="text-gray-400 text-sm">Avg Session (min)</div>
              <div className="mt-3 text-xs text-gray-500">
                Before break needed
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 w-64">
              <div className="font-semibold mb-1">Average Session Duration:</div>
              <div>• Calculated from completed sessions only</div>
              <div>• Shows your typical focus endurance</div>
              <div className="text-gray-300 mt-1">Longer sessions = better focus ability</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Brain Analysis */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Brain Analysis</h3>
                  <p className="text-gray-400 text-sm">Neural pattern insights</p>
                </div>
              </div>
              <button
                onClick={generateAIInsights}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Refresh AI'
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              {analyticsData.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3 h-3 text-purple-400" />
                  </div>
                  <p className="text-gray-300 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
                <p className="text-gray-400 text-sm">Optimized for your patterns</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {analyticsData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  </div>
                  <p className="text-gray-300 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Productivity Heatmap */}
          <div className="group lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-2xl p-6 cursor-help relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Productivity Heatmap</h3>
                <p className="text-gray-400 text-sm">
                  {selectedTimeframe === '7d' ? '7 days - 4-hour blocks' : 
                   selectedTimeframe === '30d' ? '30 days - daily activity' : 
                   '90 days - weekly activity'}
                </p>
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 max-w-xs">
              <div className="font-semibold mb-1">Productivity Heatmap:</div>
              <div>• Shows focus intensity over time</div>
              <div>• Darker colors = more completed sessions</div>
              <div className="text-gray-300 mt-1">
                {selectedTimeframe === '7d' ? 'Each square = 4-hour time block' : 
                 selectedTimeframe === '30d' ? 'Each square = one day' : 
                 'Each square = one week'}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
            
            {analyticsData.heatmapData.some(intensity => intensity > 0) ? (
              <div className={`grid gap-1 mb-4 ${
                selectedTimeframe === '7d' ? 'grid-cols-7' : 
                selectedTimeframe === '30d' ? 'grid-cols-6' : 
                'grid-cols-4'
              }`}>
                {analyticsData.heatmapData.map((intensity, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="w-full h-4 rounded transition-all hover:scale-110 cursor-pointer"
                      style={{ 
                        backgroundColor: `rgba(139, 92, 246, ${Math.max(0.1, intensity)})`,
                        opacity: Math.max(0.3, intensity + 0.2)
                      }}
                      title={`${analyticsData.timeLabels[index] || index} - ${intensity > 0 ? `${Math.round(intensity * 100)}% activity` : 'No sessions'}`}
                    ></div>
                    {selectedTimeframe === '7d' && index % 6 === 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {analyticsData.timeLabels[index]?.split(' ')[0] || ''}
                      </div>
                    )}
                    {selectedTimeframe === '30d' && index % 5 === 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {index + 1}
                      </div>
                    )}
                    {selectedTimeframe === '90d' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No Focus Sessions Yet</div>
                <div className="text-gray-500 text-sm">Complete some focus sessions to see your productivity patterns</div>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Low Focus</span>
              <div className="flex items-center space-x-2">
                {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: `rgba(139, 92, 246, ${intensity})` }}
                    ></div>
                  </div>
                ))}
              </div>
              <span>Peak Focus</span>
            </div>
          </div>

          {/* Distraction Sources */}
          <div className="group bg-gray-800/50 border border-gray-700 rounded-2xl p-6 cursor-help relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Where You Get Distracted</h3>
                <p className="text-gray-400 text-sm">Top distracting sites</p>
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 max-w-xs">
              <div className="font-semibold mb-1">Distraction Sources:</div>
              <div>• Shows sites you've attempted to visit while blocked</div>
              <div>• Based on actual blocked site visit history</div>
              <div className="text-gray-300 mt-1">Keep blocking these to maintain focus</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
            
            <div className="space-y-3">
              {analyticsData.distractionPatterns.commonSites.length > 0 ? (
                analyticsData.distractionPatterns.commonSites.map((site, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="text-gray-300 font-medium">{site}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">#{index + 1}</div>
                      <div className="text-xs text-gray-500">distraction</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No distraction data yet. Blocked site visits will appear here.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
