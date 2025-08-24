/**
 * Confidence Scorer
 * 
 * Calculates confidence scores for context alignment
 */

const fs = require('fs-extra');
const path = require('path');

class ConfidenceScorer {
    constructor() {
        // Weights for different factors
        this.weights = {
            domainAlignment: 0.40,    // Industry/domain terms match
            userAlignment: 0.30,      // Benefits target users
            competitorFeature: 0.20,  // Competitors have similar feature
            historicalPattern: 0.10   // Past violations patterns
        };

        // Thresholds for different statuses
        this.thresholds = {
            autoBlock: 95,      // Definite violation
            reviewRequired: 80, // Likely violation
            warning: 60,        // Possible drift
            monitor: 0          // Below 60%
        };

        // Domain-specific keywords that indicate misalignment
        this.domainMismatches = new Map([
            ['casino affiliate', ['invoice', 'tax', 'bookkeeping', 'accounting', 'expense tracking']],
            ['bookkeeping', ['casino', 'gambling', 'betting', 'odds', 'affiliate commission']],
            ['e-commerce', ['patient', 'medical', 'diagnosis', 'treatment', 'healthcare']],
            ['healthcare', ['product catalog', 'shopping cart', 'checkout', 'inventory']]
        ]);

        // Positive indicators by domain
        this.domainIndicators = new Map([
            ['casino affiliate', ['commission', 'referral', 'casino partner', 'offer wall', 'conversion tracking']],
            ['bookkeeping', ['invoice', 'expense', 'tax', 'receipt', 'financial report']],
            ['e-commerce', ['product', 'cart', 'checkout', 'inventory', 'shipping']],
            ['healthcare', ['patient', 'appointment', 'medical record', 'prescription', 'diagnosis']]
        ]);
    }

    /**
     * Calculate confidence score for an item
     */
    async calculateConfidenceScore(item, projectTruth, type = 'general') {
        const scores = {
            domainAlignment: await this.calculateDomainAlignment(item, projectTruth),
            userAlignment: await this.calculateUserAlignment(item, projectTruth),
            competitorFeature: await this.calculateCompetitorAlignment(item, projectTruth),
            historicalPattern: await this.calculateHistoricalPattern(item, type)
        };

        // Calculate weighted score
        const weightedScore = Object.entries(scores).reduce((total, [key, score]) => {
            return total + (score * this.weights[key]);
        }, 0);

        // Determine primary reason for score
        const primaryFactor = this.determinePrimaryFactor(scores);
        
        return {
            score: Math.round(weightedScore),
            reason: this.generateReason(primaryFactor, scores[primaryFactor]),
            details: scores,
            primaryFactor
        };
    }

    /**
     * Calculate domain alignment score
     */
    async calculateDomainAlignment(item, projectTruth) {
        const itemText = this.getItemText(item).toLowerCase();
        const domain = projectTruth.industry.toLowerCase();

        // Check for explicit mismatches
        const mismatches = this.domainMismatches.get(domain) || [];
        const mismatchCount = mismatches.filter(term => itemText.includes(term)).length;
        
        if (mismatchCount > 0) {
            // High confidence of misalignment
            return 100 - (10 * Math.min(mismatchCount, 5)); // 90-100% misalignment
        }

        // Check for positive indicators
        const indicators = this.domainIndicators.get(domain) || [];
        const indicatorCount = indicators.filter(term => itemText.includes(term)).length;
        
        if (indicatorCount > 0) {
            // Good alignment
            return Math.max(0, 20 - (indicatorCount * 5)); // 0-20% misalignment
        }

        // Check against "not this" list
        const notThisViolations = projectTruth.notThis.filter(notItem => {
            const notItemLower = notItem.toLowerCase();
            return itemText.includes(notItemLower) || 
                   notItemLower.split(' ').some(word => itemText.includes(word));
        });

        if (notThisViolations.length > 0) {
            return 95; // High confidence violation
        }

        // Check domain terms usage
        const domainTermsUsed = projectTruth.domainTerms.filter(term => 
            itemText.includes(term.term.toLowerCase())
        ).length;

        if (domainTermsUsed === 0 && projectTruth.domainTerms.length > 0) {
            // No domain terms used - possible misalignment
            return 70;
        }

        // Default neutral score
        return 40;
    }

    /**
     * Calculate user alignment score
     */
    async calculateUserAlignment(item, projectTruth) {
        const itemText = this.getItemText(item).toLowerCase();
        const primaryUser = projectTruth.targetUsers.primary.toLowerCase();
        const secondaryUser = projectTruth.targetUsers.secondary.toLowerCase();

        // Check if item mentions or benefits target users
        const mentionsPrimary = itemText.includes(primaryUser) || 
            this.benefitsUser(itemText, primaryUser);
        const mentionsSecondary = secondaryUser && 
            (itemText.includes(secondaryUser) || this.benefitsUser(itemText, secondaryUser));

        if (!mentionsPrimary && !mentionsSecondary) {
            // Doesn't seem to benefit target users
            return 80;
        }

        if (mentionsPrimary) {
            return 10; // Good alignment
        }

        return 30; // Moderate alignment (secondary user)
    }

    /**
     * Calculate competitor alignment
     */
    async calculateCompetitorAlignment(item, projectTruth) {
        // This would ideally check if competitors have similar features
        // For now, we'll use a simple heuristic
        const itemText = this.getItemText(item).toLowerCase();
        
        // Check if the feature seems unique or common
        const commonFeatures = [
            'authentication', 'login', 'user management', 'dashboard',
            'reporting', 'api', 'notifications', 'settings'
        ];

        const isCommon = commonFeatures.some(feature => itemText.includes(feature));
        
        return isCommon ? 20 : 50; // Common features are more likely aligned
    }

    /**
     * Calculate historical pattern score
     */
    async calculateHistoricalPattern(item, type) {
        // Load historical violations if available
        const violationsPath = path.join(
            __dirname, '..', '..', 
            'community-learnings', 'analysis', 'context-violations.json'
        );

        try {
            if (await fs.pathExists(violationsPath)) {
                const violations = await fs.readJSON(violationsPath);
                
                // Check for similar patterns
                const itemText = this.getItemText(item).toLowerCase();
                const similarViolations = violations.filter(v => 
                    this.isSimilarPattern(itemText, v.pattern)
                );

                if (similarViolations.length > 0) {
                    // Similar violations found
                    return Math.min(90, 60 + (similarViolations.length * 10));
                }
            }
        } catch (error) {
            // No historical data available
        }

        return 30; // Default neutral score
    }

    /**
     * Helper methods
     */
    getItemText(item) {
        if (typeof item === 'string') {
            return item;
        }
        
        // Combine various fields for analysis
        const parts = [
            item.title || '',
            item.description || '',
            item.acceptanceCriteria || '',
            item.details || ''
        ];
        
        return parts.join(' ');
    }

    benefitsUser(itemText, userType) {
        // Simple heuristic to check if feature benefits user type
        const userBenefits = {
            'casino affiliate': ['track commission', 'monitor conversion', 'partner dashboard'],
            'small business': ['manage expense', 'track income', 'generate invoice'],
            'developer': ['api access', 'webhook', 'integration'],
            'marketer': ['campaign', 'analytics', 'conversion']
        };

        const benefits = userBenefits[userType] || [];
        return benefits.some(benefit => itemText.includes(benefit));
    }

    isSimilarPattern(text1, text2) {
        // Simple similarity check - could be enhanced with better NLP
        const words1 = text1.split(/\s+/);
        const words2 = text2.split(/\s+/);
        
        const commonWords = words1.filter(w => words2.includes(w));
        const similarity = commonWords.length / Math.max(words1.length, words2.length);
        
        return similarity > 0.6;
    }

    determinePrimaryFactor(scores) {
        // Find the factor with highest contribution to misalignment
        let maxScore = 0;
        let primaryFactor = 'domainAlignment';
        
        Object.entries(scores).forEach(([factor, score]) => {
            const weightedScore = score * this.weights[factor];
            if (weightedScore > maxScore) {
                maxScore = weightedScore;
                primaryFactor = factor;
            }
        });
        
        return primaryFactor;
    }

    generateReason(factor, score) {
        const reasons = {
            domainAlignment: {
                high: 'Item contains terms explicitly outside project domain',
                medium: 'Item lacks domain-specific terminology',
                low: 'Item aligns well with project domain'
            },
            userAlignment: {
                high: 'Item does not benefit target users',
                medium: 'Unclear how item benefits target users',
                low: 'Item clearly benefits target users'
            },
            competitorFeature: {
                high: 'Feature not found in competitor products',
                medium: 'Feature alignment with market unclear',
                low: 'Common feature in the market'
            },
            historicalPattern: {
                high: 'Similar items caused context drift before',
                medium: 'Pattern resembles past violations',
                low: 'No concerning historical patterns'
            }
        };

        const level = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';
        return reasons[factor][level];
    }
}

// Export singleton instance
module.exports = {
    calculateConfidenceScore: async (item, projectTruth, type) => {
        const scorer = new ConfidenceScorer();
        return scorer.calculateConfidenceScore(item, projectTruth, type);
    },
    ConfidenceScorer
};