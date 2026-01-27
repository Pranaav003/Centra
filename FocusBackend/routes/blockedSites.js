const express = require('express');
const router = express.Router();
const BlockedSite = require('../models/BlockedSite');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const { validateObjectId } = require('../middleware/validation');

// @route   GET /api/blocked-sites
// @desc    Get all blocked sites for the authenticated user
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    const blockedSites = await BlockedSite.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Return just the domains for compatibility with frontend
    const domains = blockedSites.map(site => site.domain);

    logger.info('Blocked sites retrieved', { 
      userId: req.user._id, 
      count: domains.length 
    });

    res.json({
      success: true,
      blockedSites: domains,
      sites: blockedSites // Full site objects for future use
    });
  } catch (error) {
    logger.error('Error retrieving blocked sites', { 
      error: error.message, 
      userId: req.user._id 
    });
    next(error);
  }
});

// @route   POST /api/blocked-sites
// @desc    Add a blocked site for the authenticated user
// @access  Private
router.post('/', auth, async (req, res, next) => {
  try {
    const { domain, url, title, category } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Domain is required'
      });
    }

    // Normalize domain
    const normalizedDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Check if site already exists for this user
    const existingSite = await BlockedSite.findOne({
      userId: req.user._id,
      domain: normalizedDomain
    });

    if (existingSite) {
      // Reactivate if it was deactivated
      if (!existingSite.isActive) {
        existingSite.isActive = true;
        await existingSite.save();
      }

      logger.info('Blocked site already exists, reactivated', { 
        userId: req.user._id, 
        domain: normalizedDomain 
      });

      return res.json({
        success: true,
        message: 'Site already blocked',
        site: existingSite
      });
    }

    // Create new blocked site
    const blockedSite = new BlockedSite({
      userId: req.user._id,
      domain: normalizedDomain,
      url: url || `https://${normalizedDomain}`,
      title: title || normalizedDomain,
      category: category || 'other',
      isActive: true
    });

    await blockedSite.save();

    logger.info('Blocked site added', { 
      userId: req.user._id, 
      domain: normalizedDomain 
    });

    res.status(201).json({
      success: true,
      message: 'Site blocked successfully',
      site: blockedSite
    });
  } catch (error) {
    logger.error('Error adding blocked site', { 
      error: error.message, 
      userId: req.user._id 
    });
    next(error);
  }
});

// @route   POST /api/blocked-sites/bulk
// @desc    Add multiple blocked sites at once
// @access  Private
router.post('/bulk', auth, async (req, res, next) => {
  try {
    const { domains } = req.body;

    if (!domains || !Array.isArray(domains)) {
      return res.status(400).json({
        success: false,
        message: 'Domains array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const domain of domains) {
      try {
        const normalizedDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        // Check if already exists
        const existingSite = await BlockedSite.findOne({
          userId: req.user._id,
          domain: normalizedDomain
        });

        if (existingSite) {
          if (!existingSite.isActive) {
            existingSite.isActive = true;
            await existingSite.save();
          }
          results.push({ domain: normalizedDomain, status: 'exists' });
        } else {
          const blockedSite = new BlockedSite({
            userId: req.user._id,
            domain: normalizedDomain,
            url: `https://${normalizedDomain}`,
            title: normalizedDomain,
            category: 'other',
            isActive: true
          });
          await blockedSite.save();
          results.push({ domain: normalizedDomain, status: 'added' });
        }
      } catch (error) {
        errors.push({ domain, error: error.message });
      }
    }

    logger.info('Bulk blocked sites added', { 
      userId: req.user._id, 
      added: results.length,
      errors: errors.length
    });

    res.json({
      success: true,
      message: `Processed ${results.length} sites`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    logger.error('Error bulk adding blocked sites', { 
      error: error.message, 
      userId: req.user._id 
    });
    next(error);
  }
});

// @route   DELETE /api/blocked-sites/:id
// @desc    Remove a blocked site (soft delete - set isActive to false)
// @access  Private
router.delete('/:id', auth, validateObjectId, async (req, res, next) => {
  try {
    const blockedSite = await BlockedSite.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!blockedSite) {
      return res.status(404).json({
        success: false,
        message: 'Blocked site not found'
      });
    }

    blockedSite.isActive = false;
    await blockedSite.save();

    logger.info('Blocked site removed', { 
      userId: req.user._id, 
      domain: blockedSite.domain 
    });

    res.json({
      success: true,
      message: 'Site unblocked successfully'
    });
  } catch (error) {
    logger.error('Error removing blocked site', { 
      error: error.message, 
      userId: req.user._id 
    });
    next(error);
  }
});

// @route   DELETE /api/blocked-sites/domain/:domain
// @desc    Remove a blocked site by domain name
// @access  Private
router.delete('/domain/:domain', auth, async (req, res, next) => {
  try {
    const normalizedDomain = req.params.domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    const blockedSite = await BlockedSite.findOne({
      domain: normalizedDomain,
      userId: req.user._id
    });

    if (!blockedSite) {
      return res.status(404).json({
        success: false,
        message: 'Blocked site not found'
      });
    }

    blockedSite.isActive = false;
    await blockedSite.save();

    logger.info('Blocked site removed by domain', { 
      userId: req.user._id, 
      domain: normalizedDomain 
    });

    res.json({
      success: true,
      message: 'Site unblocked successfully'
    });
  } catch (error) {
    logger.error('Error removing blocked site by domain', { 
      error: error.message, 
      userId: req.user._id 
    });
    next(error);
  }
});

// @route   GET /api/blocked-sites/history
// @desc    Get blocked sites history (including inactive ones)
// @access  Private
router.get('/history', auth, async (req, res, next) => {
  try {
    const blockedSites = await BlockedSite.find({ 
      userId: req.user._id
    }).sort({ createdAt: -1 });

    // Format as history entries
    const history = blockedSites.map(site => ({
      site: site.domain,
      timestamp: site.createdAt,
      lastVisited: site.stats.lastBlocked || site.createdAt,
      visits: site.stats.totalBlocks || 1,
      isActive: site.isActive
    }));

    logger.info('Blocked sites history retrieved', { 
      userId: req.user._id, 
      count: history.length 
    });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    logger.error('Error retrieving blocked sites history', { 
      error: error.message, 
      userId: req.user._id 
    });
    next(error);
  }
});

module.exports = router;
