import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyFocusData {
  day: string;
  focusTime: number;
  date: string;
}

interface FocusTimeChartProps {
  sessions: any[];
}

export const FocusTimeChart: React.FC<FocusTimeChartProps> = ({ sessions }) => {
  const [graphType, setGraphType] = useState<'bar' | 'line'>('bar');
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('daily');
  
  // Generate data based on selected time period
  const generateChartData = (): DailyFocusData[] => {
    const today = new Date();
    
    switch (timePeriod) {
      case 'daily':
        return generateDailyData(today);
      case 'weekly':
        return generateWeeklyData(today);
      case 'monthly':
        return generateMonthlyData(today);
      case 'yearly':
        return generateYearlyData(today);
      case 'all':
        return generateAllTimeData();
      default:
        return generateDailyData(today);
    }
  };

  // Generate daily data (last 7 days)
  const generateDailyData = (today: Date): DailyFocusData[] => {
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateString = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        return sessionDate === dateString && session.status === 'completed';
      });
      
      const totalFocusTime = daySessions.reduce((total, session) => {
        return total + Math.floor((session.actualTime || 0) / 60);
      }, 0);
      
      days.push({
        day: dayName,
        focusTime: totalFocusTime,
        date: dateString
      });
    }
    
    return days;
  };

  // Generate weekly data (last 12 weeks)
  const generateWeeklyData = (today: Date): DailyFocusData[] => {
    const weeks = [];
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      
      // Find the start of the week (Sunday)
      const dayOfWeek = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - dayOfWeek);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekLabel = `Week ${12 - i}`;
      const dateString = weekStart.toISOString().split('T')[0];
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= weekStart && sessionDate <= weekEnd && session.status === 'completed';
      });
      
      const totalFocusTime = weekSessions.reduce((total, session) => {
        return total + Math.floor((session.actualTime || 0) / 60);
      }, 0);
      
      weeks.push({
        day: weekLabel,
        focusTime: totalFocusTime,
        date: dateString
      });
    }
    
    return weeks;
  };

  // Generate monthly data (last 12 months)
  const generateMonthlyData = (today: Date): DailyFocusData[] => {
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      const monthName = month.toLocaleDateString('en-US', { month: 'short' });
      const dateString = month.toISOString().split('T')[0];
      
      const monthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.getFullYear() === month.getFullYear() && 
               sessionDate.getMonth() === month.getMonth() && 
               session.status === 'completed';
      });
      
      const totalFocusTime = monthSessions.reduce((total, session) => {
        return total + Math.floor((session.actualTime || 0) / 60);
      }, 0);
      
      months.push({
        day: monthName,
        focusTime: totalFocusTime,
        date: dateString
      });
    }
    
    return months;
  };

  // Generate yearly data (last 5 years)
  const generateYearlyData = (today: Date): DailyFocusData[] => {
    const years = [];
    
    for (let i = 4; i >= 0; i--) {
      const year = today.getFullYear() - i;
      
      const yearSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.getFullYear() === year && session.status === 'completed';
      });
      
      const totalFocusTime = yearSessions.reduce((total, session) => {
        return total + Math.floor((session.actualTime || 0) / 60);
      }, 0);
      
      years.push({
        day: year.toString(),
        focusTime: totalFocusTime,
        date: year.toString()
      });
    }
    
    return years;
  };

  // Generate all-time data (aggregated by month)
  const generateAllTimeData = (): DailyFocusData[] => {
    const allSessions = sessions.filter(session => session.status === 'completed');
    
    if (allSessions.length === 0) return [];
    
    // Group by month
    const monthlyData = new Map<string, number>();
    
    allSessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
      
      const currentTotal = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, currentTotal + Math.floor((session.actualTime || 0) / 60));
    });
    
    // Convert to array and sort by date
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, focusTime]) => ({
        day: new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        focusTime,
        date: key
      }));
  };

  // Regenerate chart data when time period changes
  useEffect(() => {
    // This will trigger a re-render when timePeriod changes
  }, [timePeriod, sessions]);

  const chartData = generateChartData();
  const maxFocusTime = Math.max(...chartData.map(d => d.focusTime), 60); // Default to 60 minutes if no data

  const formatTime = (minutes: number) => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Focus Time: {formatTime(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-white">
            Focus Time {timePeriod === 'daily' ? 'This Week' : 
                       timePeriod === 'weekly' ? 'Last 12 Weeks' : 
                       timePeriod === 'monthly' ? 'Last 12 Months' : 
                       timePeriod === 'yearly' ? 'Last 5 Years' : 
                       'All Time'}
          </h3>
          <div className="flex items-center space-x-3">
            {/* Time Period Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Period:</span>
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setTimePeriod('daily')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timePeriod === 'daily'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimePeriod('weekly')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timePeriod === 'weekly'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimePeriod('monthly')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timePeriod === 'monthly'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimePeriod('yearly')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timePeriod === 'yearly'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setTimePeriod('all')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    timePeriod === 'all'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
            
            {/* Graph Type Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Graph:</span>
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setGraphType('bar')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    graphType === 'bar'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setGraphType('line')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    graphType === 'line'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {graphType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatTime(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="focusTime" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatTime(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="focusTime" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#1E40AF' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Time</p>
            <p className="text-lg font-semibold text-white">
              {formatTime(chartData.reduce((sum, item) => sum + item.focusTime, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Average</p>
            <p className="text-lg font-semibold text-white">
              {formatTime(Math.round(chartData.reduce((sum, item) => sum + item.focusTime, 0) / Math.max(chartData.length, 1)))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Peak</p>
            <p className="text-lg font-semibold text-white">
              {formatTime(Math.max(...chartData.map(d => d.focusTime)))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Periods</p>
            <p className="text-lg font-semibold text-white">{chartData.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
