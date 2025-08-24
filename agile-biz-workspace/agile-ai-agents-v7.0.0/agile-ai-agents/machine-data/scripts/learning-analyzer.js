/**
 * Learning Analyzer Module
 * 
 * Enhanced pattern analysis for the Learn From Contributions Workflow
 */

const fs = require('fs');
const path = require('path');

/**
 * Analyze contributions and extract patterns
 * @param {Array} contributions - Validated contributions
 * @param {Object} state - Current workflow state
 * @returns {Object} Analysis results
 */
function analyzeContributions(contributions, state) {
    const analysisResults = {
        timestamp: new Date().toISOString(),
        contributions_analyzed: contributions.length,
        patterns: [],
        metrics: {},
        insights: [],
        recommendations: []
    };
    
    // Analyze each contribution
    contributions.forEach(contrib => {
        const contribAnalysis = analyzeContribution(contrib);
        
        // Merge patterns
        contribAnalysis.patterns.forEach(pattern => {
            mergePattern(analysisResults.patterns, pattern, contrib);
        });
        
        // Aggregate metrics
        Object.entries(contribAnalysis.metrics).forEach(([key, value]) => {
            if (!analysisResults.metrics[key]) {
                analysisResults.metrics[key] = [];
            }
            analysisResults.metrics[key].push({ value, source: contrib.name });
        });
        
        // Collect insights
        analysisResults.insights.push(...contribAnalysis.insights);
    });
    
    // Cross-contribution analysis
    analysisResults.cross_patterns = identifyCrossPatterns(analysisResults.patterns);
    analysisResults.pattern_groups = groupRelatedPatterns(analysisResults.patterns);
    
    // Generate recommendations
    analysisResults.recommendations = generateRecommendations(analysisResults);
    
    return analysisResults;
}

/**
 * Analyze a single contribution
 */
function analyzeContribution(contribution) {
    let content = '';
    
    // Read content based on type
    if (contribution.type === 'file') {
        content = fs.readFileSync(contribution.path, 'utf-8');
    } else {
        // For folders, combine learnings and summary
        if (contribution.hasLearnings) {
            content += fs.readFileSync(path.join(contribution.path, 'learnings.md'), 'utf-8');
            content += '\n\n';
        }
        if (contribution.hasSummary) {
            content += fs.readFileSync(path.join(contribution.path, 'project-summary.md'), 'utf-8');
        }
    }
    
    return {
        patterns: extractEnhancedPatterns(content, contribution),
        metrics: extractEnhancedMetrics(content),
        insights: extractInsights(content)
    };
}

/**
 * Extract patterns with enhanced detection
 */
function extractEnhancedPatterns(content, contribution) {
    const patterns = [];
    const contentLower = content.toLowerCase();
    
    // Pattern detection rules
    const patternRules = [
        // Error Handling Patterns
        {
            keywords: ['error', 'exception', 'try-catch', 'defensive', 'validation', 'fallback'],
            type: 'error_handling',
            extract: (content) => {
                const errorPatterns = [];
                if (content.match(/try\s*{[\s\S]*?}\s*catch/)) {
                    errorPatterns.push('Try-catch error handling');
                }
                if (content.match(/defensive programming/i)) {
                    errorPatterns.push('Defensive programming practices');
                }
                if (content.match(/input validation/i)) {
                    errorPatterns.push('Input validation patterns');
                }
                if (content.match(/error boundar/i)) {
                    errorPatterns.push('Error boundary implementation');
                }
                return errorPatterns;
            }
        },
        
        // Performance Patterns
        {
            keywords: ['performance', 'optimization', 'speed', 'cache', 'lazy', 'memoiz', 'efficiency'],
            type: 'performance',
            extract: (content) => {
                const perfPatterns = [];
                if (content.match(/cach(e|ing)/i)) {
                    perfPatterns.push('Caching strategy');
                }
                if (content.match(/lazy load/i)) {
                    perfPatterns.push('Lazy loading implementation');
                }
                if (content.match(/memoiz/i)) {
                    perfPatterns.push('Memoization technique');
                }
                if (content.match(/token.*optim/i) || content.match(/optim.*token/i)) {
                    perfPatterns.push('Token usage optimization');
                }
                if (content.match(/parallel|concurrent/i)) {
                    perfPatterns.push('Parallel processing');
                }
                return perfPatterns;
            }
        },
        
        // Testing Patterns
        {
            keywords: ['test', 'jest', 'mocha', 'coverage', 'unit test', 'integration test', 'e2e'],
            type: 'testing',
            extract: (content) => {
                const testPatterns = [];
                if (content.match(/unit test/i)) {
                    testPatterns.push('Unit testing patterns');
                }
                if (content.match(/integration test/i)) {
                    testPatterns.push('Integration testing approach');
                }
                if (content.match(/e2e|end.to.end/i)) {
                    testPatterns.push('End-to-end testing');
                }
                if (content.match(/test coverage/i)) {
                    testPatterns.push('Coverage improvement');
                }
                if (content.match(/mock|stub/i)) {
                    testPatterns.push('Mocking strategies');
                }
                return testPatterns;
            }
        },
        
        // Deployment Patterns
        {
            keywords: ['deploy', 'ci/cd', 'pipeline', 'docker', 'kubernetes', 'rollback', 'release'],
            type: 'deployment',
            extract: (content) => {
                const deployPatterns = [];
                if (content.match(/ci.?cd|continuous/i)) {
                    deployPatterns.push('CI/CD pipeline enhancement');
                }
                if (content.match(/docker/i)) {
                    deployPatterns.push('Docker containerization');
                }
                if (content.match(/rollback/i)) {
                    deployPatterns.push('Rollback strategy');
                }
                if (content.match(/blue.green|canary/i)) {
                    deployPatterns.push('Advanced deployment strategy');
                }
                return deployPatterns;
            }
        },
        
        // Agent Coordination Patterns
        {
            keywords: ['coordination', 'handoff', 'agent communication', 'workflow', 'orchestrat'],
            type: 'coordination',
            extract: (content) => {
                const coordPatterns = [];
                if (content.match(/agent.{0,20}handoff/i)) {
                    coordPatterns.push('Agent handoff optimization');
                }
                if (content.match(/workflow.{0,20}improv/i)) {
                    coordPatterns.push('Workflow improvement');
                }
                if (content.match(/state.{0,20}manag/i)) {
                    coordPatterns.push('State management enhancement');
                }
                if (content.match(/parallel.{0,20}agent/i)) {
                    coordPatterns.push('Parallel agent execution');
                }
                return coordPatterns;
            }
        }
    ];
    
    // Apply pattern rules
    patternRules.forEach(rule => {
        const hasKeyword = rule.keywords.some(keyword => contentLower.includes(keyword));
        if (hasKeyword) {
            const extractedPatterns = rule.extract(content);
            extractedPatterns.forEach(patternName => {
                patterns.push({
                    name: patternName,
                    type: rule.type,
                    source: contribution.name,
                    confidence: calculatePatternConfidence(content, patternName),
                    occurrences: 1,
                    context: extractPatternContext(content, patternName)
                });
            });
        }
    });
    
    // Extract custom patterns from markdown sections
    const customPatterns = extractCustomPatterns(content);
    patterns.push(...customPatterns);
    
    return patterns;
}

/**
 * Calculate pattern confidence based on context
 */
function calculatePatternConfidence(content, patternName) {
    let confidence = 70; // Base confidence
    
    // Increase confidence for detailed descriptions
    if (content.match(new RegExp(patternName, 'i'))) {
        const context = content.substring(
            Math.max(0, content.search(new RegExp(patternName, 'i')) - 200),
            Math.min(content.length, content.search(new RegExp(patternName, 'i')) + 200)
        );
        
        // Check for implementation details
        if (context.match(/implement|code|example|snippet/i)) confidence += 10;
        if (context.match(/result|improve|enhance|better/i)) confidence += 10;
        if (context.match(/\d+%|significant|dramatic/i)) confidence += 5;
    }
    
    return Math.min(95, confidence);
}

/**
 * Extract pattern context
 */
function extractPatternContext(content, patternName) {
    const index = content.search(new RegExp(patternName, 'i'));
    if (index === -1) return '';
    
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 100);
    
    return content.substring(start, end).replace(/\n/g, ' ').trim();
}

/**
 * Extract custom patterns from markdown structure
 */
function extractCustomPatterns(content) {
    const patterns = [];
    
    // Look for "Pattern:" or "Learning:" sections
    const patternMatches = content.match(/(?:Pattern|Learning|Insight):\s*(.+?)(?:\n|$)/gi);
    if (patternMatches) {
        patternMatches.forEach(match => {
            const patternText = match.replace(/(?:Pattern|Learning|Insight):\s*/i, '').trim();
            patterns.push({
                name: patternText,
                type: 'custom',
                confidence: 85,
                occurrences: 1
            });
        });
    }
    
    return patterns;
}

/**
 * Extract enhanced metrics
 */
function extractEnhancedMetrics(content) {
    const metrics = {};
    
    // Performance metrics
    const perfMatches = content.match(/(\d+)%\s*(faster|slower|improvement|reduction|increase|decrease)/gi);
    if (perfMatches) {
        metrics.performance = perfMatches.map(match => {
            const [, value, direction] = match.match(/(\d+)%\s*(\w+)/);
            return { value: parseInt(value), direction, raw: match };
        });
    }
    
    // Time metrics
    const timeMatches = content.match(/(\d+)\s*(hours?|days?|minutes?|seconds?)\s*(saved|reduced|faster)/gi);
    if (timeMatches) {
        metrics.time = timeMatches.map(match => match.trim());
    }
    
    // Cost metrics
    const costMatches = content.match(/\$[\d,]+|\d+\s*dollars?/gi);
    if (costMatches) {
        metrics.cost = costMatches.map(match => match.trim());
    }
    
    // Error/bug metrics
    const errorMatches = content.match(/(\d+)\s*(errors?|bugs?|issues?)\s*(fixed|resolved|reduced)/gi);
    if (errorMatches) {
        metrics.quality = errorMatches.map(match => match.trim());
    }
    
    // Token usage metrics
    const tokenMatches = content.match(/(\d+)%?\s*tokens?\s*(saved|reduced|optimized)/gi);
    if (tokenMatches) {
        metrics.tokens = tokenMatches.map(match => match.trim());
    }
    
    return metrics;
}

/**
 * Extract insights from content
 */
function extractInsights(content) {
    const insights = [];
    
    // Look for insight markers
    const insightMarkers = [
        /key\s+(?:insight|learning|takeaway)s?:?\s*(.+?)(?:\n|$)/gi,
        /important\s+(?:note|observation)s?:?\s*(.+?)(?:\n|$)/gi,
        /lesson\s+learned:?\s*(.+?)(?:\n|$)/gi,
        /discovered\s+that\s+(.+?)(?:\n|$)/gi
    ];
    
    insightMarkers.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const insight = match.replace(pattern, '$1').trim();
                if (insight.length > 20) { // Filter out very short insights
                    insights.push(insight);
                }
            });
        }
    });
    
    return insights;
}

/**
 * Merge similar patterns
 */
function mergePattern(patterns, newPattern, contribution) {
    const existing = patterns.find(p => 
        p.name === newPattern.name && 
        p.type === newPattern.type
    );
    
    if (existing) {
        existing.occurrences++;
        existing.sources.push(contribution.name);
        existing.confidence = Math.max(existing.confidence, newPattern.confidence);
        if (newPattern.context) {
            existing.contexts = existing.contexts || [];
            existing.contexts.push(newPattern.context);
        }
    } else {
        patterns.push({
            ...newPattern,
            sources: [contribution.name],
            contexts: newPattern.context ? [newPattern.context] : []
        });
    }
}

/**
 * Identify patterns that appear across multiple contributions
 */
function identifyCrossPatterns(patterns) {
    return patterns.filter(p => p.occurrences >= 2).map(p => ({
        ...p,
        cross_contribution: true,
        strength: p.occurrences >= 3 ? 'strong' : 'moderate'
    }));
}

/**
 * Group related patterns
 */
function groupRelatedPatterns(patterns) {
    const groups = {};
    
    patterns.forEach(pattern => {
        if (!groups[pattern.type]) {
            groups[pattern.type] = [];
        }
        groups[pattern.type].push(pattern);
    });
    
    // Sort groups by total occurrences
    Object.keys(groups).forEach(type => {
        groups[type].sort((a, b) => b.occurrences - a.occurrences);
    });
    
    return groups;
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysisResults) {
    const recommendations = [];
    
    // High-confidence patterns
    const highConfidencePatterns = analysisResults.patterns.filter(p => p.confidence >= 85);
    if (highConfidencePatterns.length > 0) {
        recommendations.push({
            priority: 'high',
            type: 'implementation',
            title: 'Implement high-confidence patterns',
            patterns: highConfidencePatterns.map(p => p.name),
            rationale: 'These patterns have strong evidence and clear implementation paths'
        });
    }
    
    // Cross-contribution patterns
    const crossPatterns = analysisResults.cross_patterns;
    if (crossPatterns.length > 0) {
        recommendations.push({
            priority: 'high',
            type: 'standardization',
            title: 'Standardize cross-contribution patterns',
            patterns: crossPatterns.map(p => p.name),
            rationale: 'Multiple projects have independently discovered these patterns'
        });
    }
    
    // Performance improvements
    if (analysisResults.metrics.performance) {
        const avgImprovement = analysisResults.metrics.performance
            .filter(m => m.direction === 'improvement' || m.direction === 'faster')
            .reduce((sum, m) => sum + m.value, 0) / analysisResults.metrics.performance.length;
            
        if (avgImprovement > 20) {
            recommendations.push({
                priority: 'high',
                type: 'performance',
                title: 'Apply performance optimizations',
                expected_improvement: `${Math.round(avgImprovement)}%`,
                rationale: 'Significant performance gains demonstrated'
            });
        }
    }
    
    // Error reduction patterns
    const errorPatterns = analysisResults.patterns.filter(p => p.type === 'error_handling');
    if (errorPatterns.length >= 2) {
        recommendations.push({
            priority: 'medium',
            type: 'reliability',
            title: 'Enhance error handling across agents',
            patterns: errorPatterns.map(p => p.name),
            rationale: 'Multiple error handling improvements identified'
        });
    }
    
    return recommendations;
}

/**
 * Generate analysis report
 */
function generateAnalysisReport(analysisResults) {
    let report = `# Contribution Analysis Report\n\n`;
    report += `Date: ${analysisResults.timestamp}\n`;
    report += `Contributions Analyzed: ${analysisResults.contributions_analyzed}\n\n`;
    
    // Executive Summary
    report += `## Executive Summary\n\n`;
    report += `- Total Patterns Identified: ${analysisResults.patterns.length}\n`;
    report += `- Cross-Contribution Patterns: ${analysisResults.cross_patterns.length}\n`;
    report += `- High-Confidence Patterns: ${analysisResults.patterns.filter(p => p.confidence >= 85).length}\n`;
    report += `- Recommendations: ${analysisResults.recommendations.length}\n\n`;
    
    // Pattern Analysis
    report += `## Pattern Analysis\n\n`;
    Object.entries(analysisResults.pattern_groups).forEach(([type, patterns]) => {
        report += `### ${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Patterns\n\n`;
        patterns.forEach(pattern => {
            report += `**${pattern.name}**\n`;
            report += `- Occurrences: ${pattern.occurrences}\n`;
            report += `- Sources: ${pattern.sources.join(', ')}\n`;
            report += `- Confidence: ${pattern.confidence}%\n\n`;
        });
    });
    
    // Metrics Summary
    if (Object.keys(analysisResults.metrics).length > 0) {
        report += `## Metrics Summary\n\n`;
        Object.entries(analysisResults.metrics).forEach(([type, values]) => {
            report += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Metrics\n`;
            values.forEach(v => {
                report += `- ${v.raw || v.value} (${v.source})\n`;
            });
            report += '\n';
        });
    }
    
    // Key Insights
    if (analysisResults.insights.length > 0) {
        report += `## Key Insights\n\n`;
        analysisResults.insights.forEach((insight, index) => {
            report += `${index + 1}. ${insight}\n`;
        });
        report += '\n';
    }
    
    // Recommendations
    report += `## Recommendations\n\n`;
    analysisResults.recommendations.forEach((rec, index) => {
        report += `### ${index + 1}. ${rec.title} (${rec.priority} priority)\n`;
        report += `**Type**: ${rec.type}\n`;
        report += `**Rationale**: ${rec.rationale}\n`;
        if (rec.patterns) {
            report += `**Patterns**:\n`;
            rec.patterns.forEach(p => report += `- ${p}\n`);
        }
        if (rec.expected_improvement) {
            report += `**Expected Improvement**: ${rec.expected_improvement}\n`;
        }
        report += '\n';
    });
    
    return report;
}

module.exports = {
    analyzeContributions,
    generateAnalysisReport,
    extractEnhancedPatterns,
    extractEnhancedMetrics,
    extractInsights
};