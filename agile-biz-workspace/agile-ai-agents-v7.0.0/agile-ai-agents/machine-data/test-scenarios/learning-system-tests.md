# Community Learning System Test Scenarios

## Test Suite Overview

This document contains test scenarios for validating the Community Learning System functionality.

## 1. Single Sprint Project Contribution

### Scenario
A project that completed one sprint and wants to contribute learnings.

### Test Steps
1. Create minimal project documents:
   - `/project-documents/planning/prd.json`
   - `/project-documents/orchestration/sprint-retrospectives/sprint-001.json`
2. Run `npm run generate-contribution`
3. Verify generated files contain:
   - Project type detection
   - Sprint metrics
   - Technology stack (if available)
   - Agent participation

### Expected Results
- ✅ Contribution files generated successfully
- ✅ Privacy scan runs automatically
- ✅ All auto-populated fields have values
- ✅ Manual sections clearly marked for editing

## 2. Multi-Sprint Project with Pivots

### Scenario
A project that ran 5 sprints with a major pivot in sprint 3.

### Test Steps
1. Create project documents with:
   - 5 sprint retrospectives
   - Updated PRD showing pivot
   - Agent activity logs showing changing patterns
2. Run `npm run generate-contribution`
3. Review repository evolution section
4. Check learning patterns capture pivot

### Expected Results
- ✅ Repository evolution shows timeline of changes
- ✅ Velocity metrics show before/after pivot
- ✅ Agent learnings reflect adaptation
- ✅ Anti-patterns from false starts captured

## 3. Learning Implementation Workflow

### Scenario
Process multiple contributions and implement improvements.

### Test Steps
1. Place 3-5 contributions in `/community-learnings/contributions/`
2. Run `npm run analyze-learnings`
3. Review generated implementation plan
4. Simulate approval process
5. Check agent version updates
6. Verify broadcast system activation

### Expected Results
- ✅ Pattern detection across contributions
- ✅ Implementation plan with phases
- ✅ Risk assessment included
- ✅ Version numbers updated correctly
- ✅ Broadcasts sent to relevant agents

## 4. Cross-Agent Learning Broadcasts

### Scenario
Testing agent broadcasts high-confidence learning to other agents.

### Test Steps
1. Create learning with confidence > 0.9
2. Trigger broadcast via learning system
3. Check agent subscriptions
4. Verify reception by target agents
5. Monitor adaptation success

### Expected Results
- ✅ Broadcast reaches subscribed agents
- ✅ Relevance scoring works correctly
- ✅ Agents evaluate applicability
- ✅ Success metrics tracked
- ✅ Network visualization updates

## 5. Self-Improvement Cycles

### Scenario
Agent detects pattern and proposes self-improvement.

### Test Steps
1. Simulate error pattern detection
2. Trigger self-improvement proposal
3. Validate proposal against rules
4. Apply improvement
5. Track metrics before/after
6. Test rollback if needed

### Expected Results
- ✅ Proposal follows format
- ✅ Version increments correctly (+DATE.N)
- ✅ Metrics show improvement
- ✅ Rollback works if metrics decline
- ✅ History preserved

## 6. Version Rollbacks

### Scenario
An implemented improvement causes performance degradation.

### Test Steps
1. Implement learning that degrades performance
2. Monitor metrics for threshold breach
3. Trigger automatic rollback
4. Verify agent state restored
5. Check rollback logged properly

### Expected Results
- ✅ Performance degradation detected
- ✅ Rollback initiated within monitoring window
- ✅ Previous version restored
- ✅ Metrics return to baseline
- ✅ Failure logged for analysis

## 7. Privacy Scanner Validation

### Scenario
Contribution contains various types of sensitive data.

### Test Steps
1. Create test contribution with:
   - API keys (various formats)
   - Company names
   - Email addresses
   - Financial data
   - Internal URLs
2. Run privacy scanner
3. Review detection accuracy
4. Test anonymization features
5. Verify whitelisted items ignored

### Expected Results
- ✅ All API key patterns detected
- ✅ Company names flagged
- ✅ Financial data categorized correctly
- ✅ Whitelisted items not flagged
- ✅ Anonymization suggestions appropriate

## 8. Learning Capture at Milestones

### Scenario
Automatic learning capture triggers at key points.

### Test Steps
1. Simulate sprint end
2. Simulate deployment completion
3. Simulate feature completion
4. Simulate milestone reached
5. Check learning state updates

### Expected Results
- ✅ Sprint end triggers capture
- ✅ Deployment data collected
- ✅ Feature metrics captured
- ✅ Milestone patterns identified
- ✅ Contribution prompt shown

## 9. Command Line Interface

### Scenario
All CLI commands work as expected.

### Test Steps
1. Run each npm script command:
   - `npm run generate-contribution`
   - `npm run review-contribution`
   - `npm run submit-contribution`
   - `npm run analyze-learnings`
   - `npm run learning-report`
   - `npm run capture-summary`
   - `npm run broadcast-report`
   - `npm run version-report`
   - `npm run privacy-scan`
2. Test with various project states
3. Verify error handling

### Expected Results
- ✅ All commands execute without errors
- ✅ Output formatting correct
- ✅ Error messages helpful
- ✅ Performance within targets
- ✅ Reports accurate

## 10. Integration with Project State Manager

### Scenario
Learning system integrates seamlessly with project state.

### Test Steps
1. Check project state includes learning fields
2. Modify learning state
3. Trigger state save
4. Reload project
5. Verify learning state persisted

### Expected Results
- ✅ Learning state in project state schema
- ✅ State saves include learnings
- ✅ Persistence works correctly
- ✅ No data loss on reload
- ✅ Performance impact minimal

## Manual Test Checklist

Before release, manually verify:

- [ ] Generate contribution for real project
- [ ] Privacy scanner catches test secrets
- [ ] Review workflow opens correct files
- [ ] Submit workflow helps with PR
- [ ] Analysis finds patterns in 3+ contributions
- [ ] Implementation plan is actionable
- [ ] Version tracking works correctly
- [ ] Broadcasts reach intended agents
- [ ] Self-improvements apply successfully
- [ ] All commands have help text

## Performance Benchmarks

| Operation | Target | Acceptable |
|-----------|--------|------------|
| Generate contribution | < 5s | < 10s |
| Privacy scan | < 2s | < 5s |
| Analyze learnings | < 10s | < 20s |
| Broadcast learning | < 1s | < 2s |
| Version update | < 1s | < 2s |
| State integration | < 1s | < 2s |

## Error Scenarios

Test system handles these gracefully:

1. **No project documents**: Clear error message
2. **Malformed JSON**: Validation and recovery
3. **Missing dependencies**: Installation guidance
4. **Insufficient contributions**: Minimum threshold message
5. **Network failures**: Offline mode works
6. **File permissions**: Clear error messages
7. **Version conflicts**: Migration support

## Security Validation

Ensure system prevents:

1. **API key exposure**: Scanner catches all patterns
2. **Path traversal**: No access outside project
3. **Code injection**: Input sanitization works
4. **Data leakage**: Anonymization complete
5. **Unauthorized access**: Permission checks work

---

**Test Status**: Ready for execution
**Last Updated**: Current date
**Test Coverage**: Comprehensive