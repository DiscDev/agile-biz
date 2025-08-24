# Stakeholder Prompt Template Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive stakeholder prompt template system that allows stakeholders to prepare detailed project information before the interview phase. This will enhance the quality of project inputs and streamline the discovery process.

## Goals

1. **Reduce Interview Time**: Pre-filled answers minimize real-time questioning
2. **Improve Quality**: Stakeholders have time to think and collaborate
3. **Ensure Completeness**: Structured template captures all critical information
4. **Enable Evolution**: System learns from successful projects to improve templates
5. **Integrate Seamlessly**: Works with Context Verification and existing workflows

## Implementation Phases

### Phase 1: Template Design & Structure

#### 1.1 Universal Template Creation
**Files to Create**:
- `templates/stakeholder-prompts/universal-project-prompt.md`
- `templates/stakeholder-prompts/prompt-template-guide.md`
- `templates/stakeholder-prompts/google-docs-export-guide.md`

**Universal Sections**:
```markdown
# Project Prompt Template

## 1. Project Vision (Required)
- What are we building? (one sentence)
- Why does this need to exist?
- What problem does it solve?
- What's the vision 3 years from now?

## 2. Boundaries - What This Is NOT (Critical)
Minimum 5 specific items:
- NOT a...
- Will NOT include...
- NOT for... (user type)
- Will NOT integrate with...
- NOT competing with...

## 3. Target Users (Required)
- Primary user persona (detailed)
- Secondary users
- User problems/pain points
- Day in the life scenario

## 4. Success Metrics (Required)
- Launch success criteria
- 6-month goals
- Growth metrics
- Quality metrics

## 5. Technical Preferences
- Preferred tech stack (if any)
- Must-have integrations
- Performance requirements
- Security requirements
- Scalability needs

## 6. Business Model
- Revenue model
- Pricing strategy
- Cost considerations
- Market positioning

## 7. Constraints & Risks
- Timeline constraints
- Budget limitations
- Technical constraints
- Known risks
- Compliance requirements

## 8. Competition & Differentiation
- Direct competitors (3-5)
- How we're different
- Market gaps we're filling
- Competitive advantages
```

#### 1.2 Project-Type Modules
**Optional Sections by Type**:

**SaaS Module** (`templates/stakeholder-prompts/modules/saas-module.md`):
- Subscription tiers
- Multi-tenancy needs
- User onboarding flow
- Churn prevention strategy

**Mobile Module** (`templates/stakeholder-prompts/modules/mobile-module.md`):
- Platform priorities (iOS/Android)
- Offline requirements
- Device features needed
- App store strategy

**E-commerce Module** (`templates/stakeholder-prompts/modules/ecommerce-module.md`):
- Product catalog size
- Payment methods
- Shipping regions
- Inventory management

**API Module** (`templates/stakeholder-prompts/modules/api-module.md`):
- API consumers
- Rate limiting
- Authentication method
- Versioning strategy

**Enterprise Module** (`templates/stakeholder-prompts/modules/enterprise-module.md`):
- Integration requirements
- Compliance needs
- User management
- Reporting requirements

### Phase 2: Example Prompts & References

#### 2.1 Create Example Filled Prompts
**Location**: `templates/stakeholder-prompts/examples/`

Examples to create:
1. **B2B SaaS Example**: Project management tool
2. **Consumer Mobile**: Fitness tracking app  
3. **E-commerce**: Artisan marketplace
4. **API Service**: Weather data API
5. **Enterprise**: Internal HR system

Each example will show:
- Well-written responses
- Appropriate level of detail
- Good NOT THIS examples
- Measurable success metrics
- Clear technical constraints

#### 2.2 Quality Scoring Rubric
Create `templates/stakeholder-prompts/prompt-quality-rubric.md`:

**Scoring Criteria**:
- **Vision Clarity** (0-20 points)
  - Single sentence description: 10 pts
  - Clear problem statement: 10 pts
  
- **Boundaries** (0-25 points)
  - 5+ NOT THIS items: 15 pts
  - Specificity of items: 10 pts
  
- **User Definition** (0-20 points)
  - Detailed primary persona: 10 pts
  - Clear pain points: 10 pts
  
- **Success Metrics** (0-20 points)
  - Measurable goals: 10 pts
  - Time-bound targets: 10 pts
  
- **Technical Clarity** (0-15 points)
  - Constraints defined: 7 pts
  - Requirements clear: 8 pts

**Quality Levels**:
- 90-100: Excellent - Minimal clarification needed
- 70-89: Good - Some clarification helpful
- 50-69: Adequate - Significant clarification needed
- Below 50: Needs work - Major gaps to fill

### Phase 3: Workflow Integration

#### 3.1 Modify Project Analyzer Agent
Update to handle prompt file detection:

```javascript
// In stakeholder interview flow
async function startStakeholderInterview() {
  const hasPromptFile = await ask(
    "Have you prepared a project prompt file? This can significantly streamline our discussion. (yes/no)"
  );
  
  if (hasPromptFile === 'yes') {
    const promptPath = await ask(
      "Please provide the path to your prompt file (e.g., project-documents/stakeholder-input/project-prompt.md):"
    );
    
    const promptContent = await readPromptFile(promptPath);
    const validationResult = await validatePrompt(promptContent);
    
    showPromptScore(validationResult);
    await processPromptFile(promptContent);
  }
  
  // Continue with standard or modified interview
}
```

#### 3.2 Progressive Validation Flow
For each section in the prompt:

1. **Display Understanding**:
   ```
   Based on your project vision, I understand you want to build:
   "[Interpreted summary]"
   
   Is this accurate? (yes/no/clarify)
   ```

2. **Ask Clarifying Questions**:
   - Even for answered sections
   - Based on gaps or ambiguities
   - Maximum 2 per section

3. **Handle Missing Sections**:
   - Flag required sections
   - Ask standard questions
   - Note in final score

#### 3.3 Integration Points

**With Context Verification**:
- NOT THIS list → Project Truth constraints
- Success metrics → Monitoring thresholds
- User definitions → Validation rules

**With Existing Workflows**:
- `/start-new-project-workflow` checks for prompt file
- `/start-existing-project-workflow` can use enhancement prompt
- Prompt content feeds into all downstream phases

### Phase 4: Supporting Tools

#### 4.1 Prompt Validator
Create `machine-data/validators/prompt-validator.js`:

Features:
- Parse markdown structure
- Check required sections
- Score completeness
- Identify ambiguities
- Suggest improvements

#### 4.2 Prompt Evolution Tracker
Create `machine-data/learning/prompt-evolution-tracker.js`:

Track:
- Which prompts led to successful projects
- Common patterns in high-quality prompts
- Sections that need most clarification
- Template improvement suggestions

#### 4.3 Import Tools
Support for:
- Google Docs exported markdown
- Existing PRDs (with mapping)
- Notion exports
- Other common formats

### Phase 5: Documentation & Training

#### 5.1 User Documentation
Create comprehensive guides:
- How to fill out the template
- Google Docs workflow
- Common mistakes to avoid
- Example analysis

#### 5.2 Agent Training
Update agents to understand:
- Prompt file structure
- How to reference prompt content
- Integration with their workflows
- Quality indicators

### Phase 6: Testing & Refinement

#### 6.1 Test Scenarios
1. Perfect prompt file (90+ score)
2. Partial prompt (missing sections)
3. Vague responses needing clarification
4. Technical vs non-technical stakeholder language
5. Multi-stakeholder consolidated input

#### 6.2 Metrics to Track
- Time saved in interviews
- Prompt quality scores
- Project success correlation
- User satisfaction
- Template evolution rate

## Implementation Timeline

**Week 1**: 
- Create universal template
- Design optional modules
- Build example prompts

**Week 2**:
- Implement validator
- Update Project Analyzer Agent
- Create workflow integration

**Week 3**:
- Test with sample projects
- Refine scoring rubric
- Document processes

**Week 4**:
- Community testing
- Gather feedback
- Final adjustments

## Success Criteria

1. **Adoption**: 50%+ of new projects use prompt templates
2. **Time Savings**: 40% reduction in interview time
3. **Quality**: Average prompt score >70
4. **Evolution**: Template improvements every 30 days
5. **Integration**: Seamless with Context Verification

## Risk Mitigation

1. **Over-complexity**: Keep template simple and guided
2. **Adoption resistance**: Show clear time/quality benefits
3. **Technical barriers**: Support multiple export formats
4. **Quality variance**: Provide excellent examples and scoring

## Future Enhancements

1. **AI-Assisted Filling**: Help complete sections based on partial input
2. **Industry Templates**: Specialized templates by industry
3. **Collaborative Platform**: Real-time multi-stakeholder input
4. **Auto-Generation**: Create initial PRD from prompt
5. **Success Prediction**: ML model to predict project success from prompt

## Approval Checklist

- [ ] Universal template structure approved
- [ ] Optional modules list confirmed
- [ ] Example projects selected
- [ ] Scoring rubric acceptable
- [ ] Integration approach validated
- [ ] Timeline realistic
- [ ] Success metrics agreed

---

**Next Steps**: Upon approval, begin Phase 1 implementation with universal template creation.