const express = require('express');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const router = express.Router();

/**
 * Generate AI insights using OpenAI when OPENAI_API_KEY is set.
 * Falls back to rule-based insights otherwise.
 */
async function generateInsightsWithAI(summary) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return generateFallbackInsights(summary);
  }

  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey });

    const prompt = `You are a productivity coach. Based on the following focus analytics summary, write 3-5 short, actionable insights and 3-5 short recommendations. Be specific and encouraging. Keep each item to one sentence.

Summary:
- Focus score: ${summary.focusScore}%
- Productivity trend: ${summary.productivityTrend}
- Burnout risk: ${summary.burnoutRisk}
- Peak focus hours: ${(summary.optimalHours || []).join(', ') || 'none yet'}
- Peak distraction hours: ${(summary.peakDistractionHours || []).join(', ') || 'none'}
- Top distracting sites: ${(summary.commonSites || []).slice(0, 5).join(', ') || 'none'}
- Average session length: ${summary.avgSessionMinutes || 0} minutes
- Completion rate: ${summary.completionRate ?? 0}%
- Completed sessions in period: ${summary.totalSessionsInPeriod || 0} (last ${summary.daysInPeriod || 7} days)

Respond with valid JSON only, no markdown:
{"insights": ["insight 1", "insight 2", ...], "recommendations": ["rec 1", "rec 2", ...]}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_INSIGHTS_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.6
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) return generateFallbackInsights(summary);

    const parsed = JSON.parse(content);
    const insights = Array.isArray(parsed.insights) ? parsed.insights.slice(0, 6) : [];
    const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 6) : [];
    return { insights, recommendations };
  } catch (err) {
    logger.warn('AI insights generation failed, using fallback', { error: err.message });
    return generateFallbackInsights(summary);
  }
}

function generateFallbackInsights(summary) {
  const insights = [];
  const recommendations = [];
  const focusScore = summary.focusScore ?? 0;
  const trend = summary.productivityTrend || 'stable';
  const burnout = summary.burnoutRisk || 'low';
  const optimalHours = summary.optimalHours || [];
  const peakDistraction = summary.peakDistractionHours || [];
  const commonSites = summary.commonSites || [];
  const avgMin = summary.avgSessionMinutes || 0;
  const completionRate = summary.completionRate ?? 0;
  const totalSessions = summary.totalSessionsInPeriod || 0;
  const days = summary.daysInPeriod || 7;

  if (totalSessions === 0) {
    insights.push('No focus sessions in this period yet. Start your first session to unlock personalized insights.');
    insights.push('Your focus score will improve as you complete more sessions and build a habit.');
    recommendations.push('Start with a 25-minute Pomodoro session and block your top distracting sites.');
    recommendations.push('Set one clear goal per session to improve completion rate.');
  } else {
    if (focusScore >= 70) {
      insights.push(`Your focus score is ${focusScore}% — you're building strong focus habits.`);
    } else if (focusScore < 50) {
      insights.push(`Focus score is ${focusScore}%. Shorter, achievable sessions can help you build consistency.`);
    }
    if (trend === 'up') insights.push('Productivity trend is up compared to the previous period — keep it up.');
    if (trend === 'down') insights.push('Completion rate dipped recently; consider smaller goals or fewer sessions per day.');
    if (optimalHours.length > 0) {
      insights.push(`Your most productive hours are around ${optimalHours.map(h => `${h}:00`).join(', ')}.`);
    }
    if (peakDistraction.length > 0) {
      insights.push(`You're most tempted by distractions around ${peakDistraction.map(h => `${h}:00`).join(', ')} — consider extra blocking then.`);
    }
    if (commonSites.length > 0) {
      insights.push(`Top sites you're being blocked from: ${commonSites.slice(0, 3).join(', ')}.`);
    }
    if (avgMin > 0) insights.push(`Average session length is ${Math.round(avgMin)} minutes.`);
    if (completionRate >= 80) insights.push('High session completion rate — great consistency.');
    if (completionRate < 60 && totalSessions > 0) insights.push('Try setting slightly lower session goals to improve completion rate.');

    if (burnout === 'high') {
      recommendations.push('Burnout risk is elevated. Reduce session frequency and take more breaks.');
    }
    if (optimalHours.length > 0) {
      recommendations.push(`Schedule your hardest tasks during ${optimalHours[0]}:00 when you focus best.`);
    }
    if (peakDistraction.length > 0) {
      recommendations.push(`Use scheduled blocking during ${peakDistraction[0]}:00–${peakDistraction[0] + 1}:00 to protect focus.`);
    }
    if (commonSites.length > 0 && avgMin < 25) {
      recommendations.push('Try Pomodoro: 25 minutes focused, then a short break.');
    }
    recommendations.push('Review your blocked sites list weekly and add any new distractions.');
  }

  return {
    insights: insights.length > 0 ? insights : ['Complete more sessions to get personalized insights.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Block distracting sites and start a focus session to see recommendations.']
  };
}

// @route   POST /api/analytics/insights
// @desc    Generate AI-powered insights and recommendations from analytics summary
// @access  Private
router.post('/insights', auth, async (req, res, next) => {
  try {
    const {
      focusScore,
      productivityTrend,
      burnoutRisk,
      optimalHours,
      peakDistractionHours,
      commonSites,
      avgSessionMinutes,
      completionRate,
      totalSessionsInPeriod,
      daysInPeriod
    } = req.body || {};

    const summary = {
      focusScore: Number(focusScore) || 0,
      productivityTrend: ['up', 'down', 'stable'].includes(productivityTrend) ? productivityTrend : 'stable',
      burnoutRisk: ['low', 'medium', 'high'].includes(burnoutRisk) ? burnoutRisk : 'low',
      optimalHours: Array.isArray(optimalHours) ? optimalHours.map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 23) : [],
      peakDistractionHours: Array.isArray(peakDistractionHours) ? peakDistractionHours.map(Number).filter(n => !isNaN(n) && n >= 0 && n <= 23) : [],
      commonSites: Array.isArray(commonSites) ? commonSites.slice(0, 10) : [],
      avgSessionMinutes: Number(avgSessionMinutes) || 0,
      completionRate: Number(completionRate) || 0,
      totalSessionsInPeriod: Number(totalSessionsInPeriod) || 0,
      daysInPeriod: Number(daysInPeriod) || 7
    };

    const { insights, recommendations } = await generateInsightsWithAI(summary);

    logger.info('Analytics insights generated', { userId: req.user._id, insightCount: insights.length });

    res.json({
      success: true,
      insights,
      recommendations
    });
  } catch (error) {
    logger.error('Analytics insights error', { error: error.message, userId: req.user?._id });
    next(error);
  }
});

module.exports = router;
