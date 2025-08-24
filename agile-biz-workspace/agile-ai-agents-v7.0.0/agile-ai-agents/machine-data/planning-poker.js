/**
 * Planning Poker System
 * Chat-based estimation with two-round consensus for AI agents
 */

const fs = require('fs');
const path = require('path');
const { calibration } = require('./story-point-calibration');

class PlanningPoker {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.sessionsPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'planning-sessions'
    );
    
    // Active sessions
    this.activeSessions = {};
    
    // Historical data for estimation suggestions
    this.historicalEstimates = this.loadHistoricalData();
    
    // Ensure sessions directory exists
    this.ensureSessionsDirectory();
  }
  
  ensureSessionsDirectory() {
    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true });
      console.log(`📁 Created planning sessions directory: ${this.sessionsPath}`);
    }
  }
  
  /**
   * Create a new planning poker session
   */
  createSession(sessionData) {
    const sessionId = `poker_${Date.now()}`;
    
    const session = {
      meta: {
        document_type: "planning_poker_session",
        version: "1.0.0",
        created_at: new Date().toISOString()
      },
      session: {
        id: sessionId,
        story: sessionData.story,
        participants: sessionData.participants || [],
        rounds: [],
        status: 'active',
        consensus: null,
        historical_suggestion: this.getHistoricalSuggestion(sessionData.story),
        discussion_points: []
      }
    };
    
    this.activeSessions[sessionId] = session;
    this.saveSession(session);
    
    console.log(`🎲 Created planning poker session: ${sessionId}`);
    return session;
  }
  
  /**
   * Get historical estimation suggestion
   */
  getHistoricalSuggestion(story) {
    const similar = this.findSimilarStories(story);
    
    if (similar.length === 0) {
      return {
        has_suggestion: false,
        message: "No similar stories found for reference"
      };
    }
    
    // Calculate average points from similar stories
    const totalPoints = similar.reduce((sum, s) => sum + s.points, 0);
    const avgPoints = totalPoints / similar.length;
    const suggestedPoints = calibration.roundToFibonacci(avgPoints);
    
    return {
      has_suggestion: true,
      suggested_points: suggestedPoints,
      confidence: this.calculateConfidence(similar),
      similar_stories: similar.slice(0, 3).map(s => ({
        title: s.title,
        points: s.points,
        similarity: s.similarity
      })),
      message: `Based on ${similar.length} similar stories, suggested estimate: ${suggestedPoints} points`
    };
  }
  
  /**
   * Find similar stories from historical data
   */
  findSimilarStories(story) {
    const similar = [];
    const storyWords = this.tokenize(story.title + ' ' + story.description);
    
    for (const historical of this.historicalEstimates) {
      const historicalWords = this.tokenize(historical.title + ' ' + historical.description);
      const similarity = this.calculateSimilarity(storyWords, historicalWords);
      
      if (similarity > 0.3) {
        similar.push({
          ...historical,
          similarity: similarity
        });
      }
    }
    
    // Sort by similarity
    similar.sort((a, b) => b.similarity - a.similarity);
    
    return similar;
  }
  
  /**
   * Simple tokenization for similarity comparison
   */
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }
  
  /**
   * Calculate similarity between two word sets
   */
  calculateSimilarity(words1, words2) {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Calculate confidence in historical suggestion
   */
  calculateConfidence(similarStories) {
    if (similarStories.length < 2) return 'low';
    
    // Calculate variance in points
    const points = similarStories.map(s => s.points);
    const avg = points.reduce((a, b) => a + b) / points.length;
    const variance = points.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / points.length;
    const stdDev = Math.sqrt(variance);
    
    // Low variance = high confidence
    if (stdDev < 1) return 'high';
    if (stdDev < 2) return 'medium';
    return 'low';
  }
  
  /**
   * Submit estimate for a participant
   */
  submitEstimate(sessionId, participant, estimate, reasoning = '') {
    const session = this.activeSessions[sessionId];
    
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    if (session.session.status !== 'active') {
      throw new Error(`Session ${sessionId} is not active`);
    }
    
    // Get current round or create first round
    let currentRound = session.session.rounds[session.session.rounds.length - 1];
    
    if (!currentRound || currentRound.status === 'complete') {
      currentRound = {
        round_number: session.session.rounds.length + 1,
        estimates: {},
        status: 'collecting',
        started_at: new Date().toISOString()
      };
      session.session.rounds.push(currentRound);
    }
    
    // Record estimate
    currentRound.estimates[participant] = {
      points: estimate,
      reasoning: reasoning,
      submitted_at: new Date().toISOString()
    };
    
    // Check if all participants have submitted
    const allSubmitted = session.session.participants.every(
      p => currentRound.estimates[p] !== undefined
    );
    
    if (allSubmitted) {
      this.processRound(session);
    }
    
    this.saveSession(session);
    
    console.log(`📊 ${participant} estimated ${estimate} points for session ${sessionId}`);
    return session;
  }
  
  /**
   * Process completed round
   */
  processRound(session) {
    const currentRound = session.session.rounds[session.session.rounds.length - 1];
    currentRound.status = 'complete';
    currentRound.completed_at = new Date().toISOString();
    
    // Calculate round statistics
    const estimates = Object.values(currentRound.estimates).map(e => e.points);
    const min = Math.min(...estimates);
    const max = Math.max(...estimates);
    const avg = estimates.reduce((a, b) => a + b) / estimates.length;
    const range = max - min;
    
    currentRound.statistics = {
      min: min,
      max: max,
      average: avg,
      range: range,
      consensus: range <= 1
    };
    
    // Check for consensus
    if (currentRound.statistics.consensus || session.session.rounds.length >= 2) {
      // Consensus reached or max rounds completed
      this.completeSession(session);
    } else {
      // Need another round - generate discussion prompts
      this.generateDiscussionPrompts(session, currentRound);
    }
  }
  
  /**
   * Generate discussion prompts for divergent estimates
   */
  generateDiscussionPrompts(session, round) {
    const prompts = [];
    const estimates = round.estimates;
    
    // Find outliers
    const values = Object.entries(estimates).map(([agent, est]) => ({
      agent: agent,
      points: est.points,
      reasoning: est.reasoning
    }));
    
    values.sort((a, b) => a.points - b.points);
    
    const lowest = values[0];
    const highest = values[values.length - 1];
    
    if (highest.points > lowest.points * 2) {
      prompts.push({
        type: 'large_variance',
        message: `${highest.agent} estimated ${highest.points} while ${lowest.agent} estimated ${lowest.points}. Let's discuss the complexity differences.`,
        focus_agents: [highest.agent, lowest.agent]
      });
    }
    
    // Check against historical suggestion
    if (session.session.historical_suggestion.has_suggestion) {
      const suggested = session.session.historical_suggestion.suggested_points;
      const avgEstimate = round.statistics.average;
      
      if (Math.abs(avgEstimate - suggested) > 3) {
        prompts.push({
          type: 'historical_divergence',
          message: `Team average (${avgEstimate.toFixed(1)}) differs significantly from historical suggestion (${suggested}). What makes this story unique?`,
          focus_agents: 'all'
        });
      }
    }
    
    // Add specific discussion points
    if (lowest.reasoning || highest.reasoning) {
      prompts.push({
        type: 'reasoning_review',
        message: 'Review the reasoning provided by agents with extreme estimates',
        reasoning: {
          lowest: { agent: lowest.agent, reasoning: lowest.reasoning },
          highest: { agent: highest.agent, reasoning: highest.reasoning }
        }
      });
    }
    
    session.session.discussion_points = prompts;
  }
  
  /**
   * Complete session and calculate final estimate
   */
  completeSession(session) {
    session.session.status = 'complete';
    
    const lastRound = session.session.rounds[session.session.rounds.length - 1];
    const estimates = Object.values(lastRound.estimates).map(e => e.points);
    
    // Calculate consensus estimate
    if (lastRound.statistics.consensus) {
      // If consensus, use the agreed value
      session.session.consensus = {
        points: estimates[0],
        method: 'consensus',
        confidence: 'high'
      };
    } else {
      // No consensus - use average and round to Fibonacci
      const avg = estimates.reduce((a, b) => a + b) / estimates.length;
      const rounded = calibration.roundToFibonacci(avg);
      
      session.session.consensus = {
        points: rounded,
        method: 'average_rounded',
        confidence: lastRound.statistics.range > 5 ? 'low' : 'medium',
        note: `Averaged from range ${lastRound.statistics.min}-${lastRound.statistics.max}`
      };
    }
    
    // Add to historical data
    this.addToHistory(session);
    
    console.log(`✅ Planning poker complete: ${session.session.consensus.points} points`);
  }
  
  /**
   * Add completed session to historical data
   */
  addToHistory(session) {
    const historical = {
      title: session.session.story.title,
      description: session.session.story.description,
      points: session.session.consensus.points,
      participants: session.session.participants.length,
      rounds: session.session.rounds.length,
      consensus_method: session.session.consensus.method,
      timestamp: new Date().toISOString()
    };
    
    this.historicalEstimates.push(historical);
    this.saveHistoricalData();
  }
  
  /**
   * Save session to file
   */
  saveSession(session) {
    const sessionPath = path.join(this.sessionsPath, `${session.session.id}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  }
  
  /**
   * Load historical estimation data
   */
  loadHistoricalData() {
    const historyPath = path.join(this.sessionsPath, 'estimation-history.json');
    
    try {
      if (fs.existsSync(historyPath)) {
        const data = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
        return data.estimates || [];
      }
    } catch (error) {
      console.error('Error loading historical data:', error.message);
    }
    
    // Return some default historical data
    return [
      {
        title: "User login implementation",
        description: "Basic login with email/password",
        points: 3,
        participants: 3,
        rounds: 1,
        consensus_method: 'consensus'
      },
      {
        title: "Payment integration",
        description: "Stripe payment processing",
        points: 8,
        participants: 4,
        rounds: 2,
        consensus_method: 'average_rounded'
      },
      {
        title: "Dashboard UI",
        description: "Admin dashboard with charts",
        points: 5,
        participants: 3,
        rounds: 1,
        consensus_method: 'consensus'
      }
    ];
  }
  
  /**
   * Save historical data
   */
  saveHistoricalData() {
    const historyPath = path.join(this.sessionsPath, 'estimation-history.json');
    
    const data = {
      meta: {
        document_type: "estimation_history",
        version: "1.0.0",
        updated_at: new Date().toISOString()
      },
      total_estimates: this.historicalEstimates.length,
      estimates: this.historicalEstimates
    };
    
    fs.writeFileSync(historyPath, JSON.stringify(data, null, 2));
  }
  
  /**
   * Get active sessions
   */
  getActiveSessions() {
    return Object.values(this.activeSessions).filter(s => s.session.status === 'active');
  }
  
  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.activeSessions[sessionId] || null;
  }
}

// Export the class and create instance
const planningPoker = new PlanningPoker();

module.exports = {
  PlanningPoker,
  planningPoker,
  
  // Convenience exports
  createSession: (data) => planningPoker.createSession(data),
  submitEstimate: (sessionId, agent, estimate, reasoning) => 
    planningPoker.submitEstimate(sessionId, agent, estimate, reasoning),
  getSession: (sessionId) => planningPoker.getSession(sessionId),
  getActiveSessions: () => planningPoker.getActiveSessions()
};

// If run directly, simulate a planning poker session
if (require.main === module) {
  console.log('🎲 Simulating Planning Poker Session');
  
  // Create session
  const session = planningPoker.createSession({
    story: {
      title: "Implement user profile page",
      description: "Create a user profile page with edit capabilities"
    },
    participants: ['coder_agent', 'ui_ux_agent', 'testing_agent']
  });
  
  console.log('Historical suggestion:', session.session.historical_suggestion);
  
  // Round 1 estimates
  planningPoker.submitEstimate(session.session.id, 'coder_agent', 5, 
    'Medium complexity with form validation and API calls');
  planningPoker.submitEstimate(session.session.id, 'ui_ux_agent', 3, 
    'Simple layout with existing components');
  planningPoker.submitEstimate(session.session.id, 'testing_agent', 5, 
    'Need comprehensive form and API tests');
  
  // Check if need round 2
  const updatedSession = planningPoker.getSession(session.session.id);
  
  if (updatedSession.session.status === 'active') {
    console.log('Round 2 needed. Discussion points:', 
      updatedSession.session.discussion_points);
    
    // Round 2 estimates (converging)
    planningPoker.submitEstimate(session.session.id, 'coder_agent', 5);
    planningPoker.submitEstimate(session.session.id, 'ui_ux_agent', 5);
    planningPoker.submitEstimate(session.session.id, 'testing_agent', 5);
  }
  
  const finalSession = planningPoker.getSession(session.session.id);
  console.log('Final consensus:', finalSession.session.consensus);
}