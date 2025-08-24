# Stakeholder Interview Templates

## Overview
This document provides standardized interview templates for the Project Analyzer Agent to conduct comprehensive stakeholder interviews. These templates ensure consistent information gathering across both new and existing projects.

## Section-by-Section Interview Process

### How the Iterative Process Works
1. **Ask Initial Questions** - Present questions for one section at a time
2. **Record Responses** - Document answers in appropriate MD file
3. **Ask Follow-up Questions** - Clarify any ambiguous or incomplete responses
4. **Present Understanding** - "Based on your answers, here's my understanding..."
5. **Get Approval** - "Is this correct? (yes/no)"
6. **Iterate if Needed** - Continue clarifying until stakeholder approves
7. **Move to Next Section** - Only proceed after approval of current section

### Section Approval Recording
After each section approval, record:
```yaml
section: "project-vision"
approved: true
timestamp: "2025-01-20T10:15:00Z"
iterations_needed: 2
key_clarifications:
  - "Clarified target audience includes both B2B and B2C"
  - "Confirmed mobile-first approach"
```

## New Project Workflow Interview Process

### Pre-Interview: Check for Pre-filled Prompt
**Action**: First check if `templates/stakeholder-prompts/universal-project-prompt.md` has been filled out.

**If prompt exists:**
1. Load and parse the pre-filled information
2. Present summary back to stakeholder for confirmation
3. Only ask clarifying questions for gaps or ambiguities
4. Skip to Section Approval

**If no prompt:**
Continue with streamlined interview below.

### Phase 1: Core Identity (5 Essential Questions)
**File**: `project-documents/new-project-planning/stakeholder-interview/project-identity.md`

**Questions (Skip if answered in prompt):**
1. "In one sentence, what are you building?"
2. "What specific industry or domain does this serve?" (e.g., "online casino affiliate management" not just "finance")
3. "Who exactly will use this?" (be very specific - B2B/B2C, company size, user role)
4. "Name 3 direct competitors"
5. "What is this product NOT?" (minimum 5 items to prevent scope creep)

**Validation from Prompt Fields:**
- Maps to: Section 1 (Project Vision), Section 2 (Boundaries), Section 8 (Competition)
- If pre-filled, only confirm understanding

**Approval Statement:**
"Based on [your prompt/your answers], I understand you're building [one sentence] for [specific industry] targeting [specific users]. This is NOT [list]. Your main competitors are [names]. Is this correct?"

### Phase 2: Problem & Value (4 Questions)
**File**: `project-documents/new-project-planning/stakeholder-interview/problem-value.md`

**Questions (Skip if answered in prompt):**
6. "What specific problem does this solve for your users?"
7. "How are they solving this problem today without your product?"
8. "What's your unique value proposition compared to competitors?"
9. "Can you walk me through a typical user scenario?"

**Validation from Prompt Fields:**
- Maps to: Section 1.2 (Why does this need to exist), Section 3 (User Problems), Section 8 (How We're Different)
- If pre-filled, only verify understanding

### Phase 3: Business Strategy (5 Questions)
**File**: `project-documents/new-project-planning/stakeholder-interview/business-strategy.md`

**Questions (Skip if answered in prompt):**
10. "Is this a personal project, startup, or enterprise initiative?"
11. "How will this generate value?" (revenue model/cost savings/efficiency)
12. "What does success look like?" (specific metrics at 6 months, 1 year)
13. "What's your budget range?" (helps determine technology choices)
14. "Have you validated this with potential users?" (what did you learn?)

**Validation from Prompt Fields:**
- Maps to: Section 4 (Success Metrics), Section 6 (Business Model)
- If pre-filled, confirm metrics are measurable

### Phase 4: Technical & Constraints (4 Questions)
**File**: `project-documents/new-project-planning/stakeholder-interview/technical-constraints.md`

**Questions (Skip if answered in prompt):**
15. "Do you have technology preferences or should I recommend?"
16. "What's your target timeline for launch?"
17. "List your top 3-5 must-have features for MVP"
18. "Are there any compliance requirements?" (GDPR, HIPAA, SOC2, etc.)

**Validation from Prompt Fields:**
- Maps to: Section 5 (Technical Preferences), Section 7 (Constraints & Risks)
- If pre-filled, only clarify ambiguities

## Smart Interview Process Flow

### Step 1: Check for Pre-filled Prompt
```javascript
// Pseudo-code for the process
if (fileExists('templates/stakeholder-prompts/universal-project-prompt.md')) {
  const prompt = loadPrompt();
  const gaps = identifyMissingFields(prompt);
  
  if (gaps.length === 0) {
    presentSummaryForApproval(prompt);
    return; // Skip to implementation
  } else {
    askOnlyGapQuestions(gaps);
  }
} else {
  // Continue with full streamlined interview (18 questions)
}
```

### Step 2: Dynamic Question Selection

**Field Mapping Table:**
| Interview Question | Prompt Section | Field Name |
|-------------------|----------------|------------|
| Q1: What are you building? | Section 1 | "What are we building?" |
| Q2: Industry/domain | Section 2 | Industry context from boundaries |
| Q3: Target users | Section 3 | "Primary User Persona" |
| Q4: Competitors | Section 8 | "Direct Competitors" |
| Q5: What is NOT | Section 2 | "Boundaries - What This Is NOT" |
| Q6: Problem solved | Section 1 | "What problem does it solve?" |
| Q7: Current solutions | Section 3 | Inferred from pain points |
| Q8: Unique value | Section 8 | "How We're Different" |
| Q9: User scenario | Section 3 | "Day in the Life" |
| Q10: Project type | Additional Context | "Team Information" |
| Q11: Revenue model | Section 6 | "Revenue Model" |
| Q12: Success metrics | Section 4 | "Success Metrics" |
| Q13: Budget | Section 6 | "Cost Considerations" |
| Q14: Validation | Section 1 | Inferred from vision |
| Q15: Tech preferences | Section 5 | "Preferred Technology Stack" |
| Q16: Timeline | Section 7 | "Timeline Constraints" |
| Q17: MVP features | Section 4 | Derived from success criteria |
| Q18: Compliance | Section 7 | "Compliance Requirements" |

### Step 3: Intelligent Follow-ups

**Only ask follow-ups when:**
- Answer is vague (e.g., "finance" instead of specific industry)
- Critical information missing (e.g., no "NOT" boundaries)
- Conflicting information detected
- Domain-specific clarification needed

### Step 4: Final Confirmation

**Comprehensive Approval Statement:**
"Based on your [prompt/responses], here's my complete understanding:

**WHAT**: You're building [one sentence description]
**WHO**: For [specific users] in [specific industry]
**WHY**: To solve [specific problem]
**HOW**: Using [tech stack] with [timeline]
**NOT**: This is explicitly NOT [5+ boundaries]
**SUCCESS**: Measured by [specific metrics]

Is this accurate and complete?"

## Integration with Prompt Templates

### When Prompt is Pre-filled:

**Display Format:**
```markdown
## Information from Your Prompt

✅ **Project Identity**: [Confirmed from prompt]
✅ **Target Users**: [Confirmed from prompt]
✅ **Business Model**: [Confirmed from prompt]
⚠️ **Budget Range**: [Not specified - need to ask]
⚠️ **User Validation**: [Not found - need to ask]

I have your comprehensive prompt. I just need to clarify:
- Question 13: What's your budget range?
- Question 14: Have you validated this with users?
```

### When Prompt is Partially Filled:

**Adaptive Questioning:**
- Skip all answered questions
- Group remaining questions by phase
- Ask in logical sequence
- Reference prompt answers in follow-ups

### When No Prompt Exists:

**Streamlined 18-Question Interview:**
- No redundant questions
- Clear progression through phases
- Each question has unique purpose
- Approval after each phase

## Existing Project Workflow Interview Sections

### Pre-Interview: Code Analysis Presentation
**File**: `project-documents/existing-project-analysis/initial-analysis-summary.md`

Present findings before starting interview:
"I've completed an initial analysis of your codebase. Here's what I found:
- Technology Stack: [list]
- Architecture Pattern: [pattern]
- Code Metrics: [coverage, quality scores]
- Key Observations: [major findings]"

### Section 0: Verify What We're Working On (CRITICAL)
**File**: `project-documents/existing-project-analysis/stakeholder-interview/project-identity-verification.md`

**Initial Questions:**
1. "Based on my analysis, this appears to be [initial assessment]. In one sentence, what is this product?"
2. "What industry or domain does this serve?"
3. "Who are your current users? (Be specific)"
4. "What is this product NOT? (What might people mistakenly think it is?)"
5. "Who are your main competitors?"

**Analysis-Informed Follow-ups:**
- "I noticed [feature/code]. Is this for [assumed purpose] or something else?"
- "The codebase mentions [term]. In your domain, what does this mean?"
- "I found references to [functionality]. Is this core to your product?"

**Context Verification:**
- Compare stated purpose with code analysis
- Flag any major disconnects between code and stated purpose
- Identify domain-specific terminology in codebase

**Approval Statement:**
"To confirm: You're running [one sentence description] for [specific industry] serving [specific users]. This is NOT [list of what it's not]. Your competitors are [competitors]. The main purpose is [core purpose]. Is this accurate?"

### Section 1: Current State Validation
**File**: `project-documents/existing-project-analysis/stakeholder-interview/current-state.md`

**Initial Questions (Informed by Analysis):**
1. "I've detected this is a [type] application. Is this primarily [purpose]?"
2. "I found [X] main components/services. Are there any I missed?"
3. "Is this currently in production? If yes, approximately how many users?"
4. "How long has this project been in development?"
5. "What's your current team size?"

**Analysis-Specific Questions:**
- "I noticed you're using [old version]. Any constraints preventing an upgrade?"
- "Your [component] handles [function]. Is this critical to maintain?"
- "I found [X]% test coverage. What's your target?"

### Section 2: Technical Landscape Verification
**File**: `project-documents/existing-project-analysis/stakeholder-interview/technical-landscape.md`

**Initial Questions:**
1. "I detected [technologies]. Are there other key technologies?"
2. "You're hosted on [platform]. Any plans to migrate?"
3. "I found integrations with [services]. Are these all active?"
4. "Your database is [type/version]. Any performance concerns?"

### Section 2.5: Project Structure Evaluation (NEW)
**File**: `project-documents/existing-project-analysis/stakeholder-interview/structure-evaluation.md`

**Analysis Presentation:**
"I've analyzed your project structure. Here's what I found:"

**Current Structure:**
```
[Show actual structure]
Example:
├── src/               # Mixed frontend/backend code
├── server/            # Backend API
├── public/            # Static assets
└── package.json       # Mixed dependencies
```

**Identified Issues:**
- [List structure issues found]
- Example: "Frontend code mixed in root directory"
- Example: "No clear separation between frontend and backend"
- Example: "Shared dependencies causing conflicts"

**Recommended Structure:**
```
[Show recommended structure based on tech stack]
```

**Migration Benefits:**
- Cleaner separation of concerns
- Independent deployment capability
- Easier onboarding for new developers
- Better build performance
- Reduced merge conflicts

**Structure Decision Questions:**
1. "Would you like to:"
   - Keep the current structure as-is
   - Migrate to recommended structure (gradual migration plan)
   - Migrate to recommended structure (immediate refactor)
   - Customize the recommended structure
   
2. "If migrating, when would you prefer to do this?"
   - Before starting new features
   - As part of first sprint
   - Gradually over multiple sprints
   - Create a dedicated migration sprint

**Approval Statement:**
"Based on your decision, we'll [keep current/migrate to new] structure. [If migrating: The migration will happen [timing]]. Is this correct?"

### Section 3: Improvement Goals
**File**: `project-documents/existing-project-analysis/stakeholder-interview/improvement-goals.md`

**Initial Questions:**
1. "What brings you here? (bug fixes/new features/optimization/refactoring)"
2. "What are your top 3 pain points with the current system?"
3. "Any critical issues needing immediate attention?"
4. "What's your timeline for improvements?"

**Analysis-Informed Questions:**
- "I found [specific issues]. Were you aware of these?"
- "Your [component] could benefit from [improvement]. Is this a priority?"
- "I noticed [security issue]. Should we address this first?"

### Section 4: Enhancement Boundaries
**File**: `project-documents/existing-project-analysis/stakeholder-interview/analysis-boundaries.md`

**Initial Questions:**
1. "Should I analyze the entire codebase or focus on specific areas?"
2. "Are there any parts we should NOT modify?"
3. "Any third-party or generated code to exclude?"
4. "Interested in a full security audit? Performance profiling?"

## Initial Stakeholder Interview (All Projects)

### Project Context & Goals

**Interviewer Introduction:**
"I'd like to understand your vision and objectives for this project. Your answers will help all our specialized agents align their work with your goals."

**Questions:**
- What is the primary purpose and business objective of this project?
- Who are the main users or customers, and what problems does it solve for them?
- What are the current pain points or challenges you're facing with the system? (if existing project)
- What inspired this project idea? What opportunity are you trying to capture? (if new project)
- How do you define success for this project? What are your key metrics?
- What is your vision for where this project will be in 1 year? 5 years?

**Optional Follow-ups:**
- Are there any similar solutions you admire or want to differentiate from?
- What unique value proposition does your project offer?
- Have you validated this idea with potential users/customers?

### Technical Scope & Architecture

**Interviewer Introduction:**
"Now let's discuss the technical aspects and any preferences or constraints you have."

**Questions:**
- What technologies, frameworks, and programming languages are currently used? (existing)
- Do you have any technology preferences or requirements? (new)
- Can you describe the overall system architecture at a high level? (existing)
- What kind of architecture do you envision? (monolithic, microservices, serverless, etc.) (new)
- Are there any integrations with external systems, APIs, or databases required?
- What deployment environments does/will this run in? (cloud platforms, on-premise, hybrid)
- Are there any technical constraints we should be aware of? (legacy systems, compatibility, etc.)

**Optional Follow-ups:**
- Do you have preferences for specific cloud providers (AWS, Azure, GCP)?
- Are there any performance requirements or SLAs to meet?
- What about mobile/web/desktop platform requirements?

### Analysis Objectives

**Interviewer Introduction:**
"I want to ensure our analysis focuses on what matters most to you."

**Questions:**
- What specific outcomes are you hoping to achieve from this analysis?
- Are you looking for:
  - Security vulnerabilities or compliance gaps?
  - Performance issues or optimization opportunities?
  - Code quality problems or technical debt assessment?
  - Scalability or architecture improvements?
- Are there particular areas of the codebase you're most concerned about? (existing)
- What aspects of the project keep you up at night?
- Do you need recommendations for:
  - Refactoring or modernization?
  - New features or enhancements?
  - Cost optimization?
  - Team scaling or process improvements?

**Optional Follow-ups:**
- Have you had any security incidents or performance issues?
- Are there any upcoming audits or compliance requirements?

### Project Health & History

**Interviewer Introduction:**
"Understanding the project's history and current state helps us provide better recommendations."

**Questions:**
- How long has this project been in development? (existing)
- What's your timeline for launching this project? (new)
- What's the current development team size and structure?
- Are there known bugs, performance issues, or areas that frequently break? (existing)
- What's your release cycle and deployment process like?
- How do you currently handle testing and quality assurance?
- What's the current user base size? Growth rate? (if applicable)

**Optional Follow-ups:**
- Have there been any major pivots or architecture changes?
- What's the typical development velocity?
- Are there any team dynamics or skill gaps to consider?

### Constraints & Priorities

**Interviewer Introduction:**
"Every project has constraints. Understanding yours helps us provide realistic recommendations."

**Questions:**
- Are there any compliance requirements, security standards, or regulatory considerations?
  - (GDPR, HIPAA, SOC2, PCI-DSS, etc.)
- What's your timeline for implementing any recommended changes?
- Are there budget constraints that would limit potential improvements?
- Which aspects are most critical to address first?
- Are there any non-negotiable requirements or red lines?
- What trade-offs are you willing to make? (time vs. features vs. quality)

**Optional Follow-ups:**
- Do you have any contractual obligations or SLAs?
- Are there any political or organizational constraints?
- What's your risk tolerance for new technologies or approaches?

### Documentation & Resources

**Interviewer Introduction:**
"Finally, let's discuss what resources and documentation are available to help our analysis."

**Questions:**
- What existing documentation is available?
  - Technical specifications
  - API documentation
  - Deployment guides
  - Architecture diagrams
- Are there automated tests, and what's the current test coverage?
- Can you provide access to:
  - Logs and monitoring data?
  - Performance metrics?
  - User analytics?
  - Error tracking systems?
- Who are the key technical stakeholders or domain experts we might need to consult?

**Optional Follow-ups:**
- Are there any tribal knowledge areas not well documented?
- Do you have any technical debt documentation?
- Are there any post-mortems or lessons learned documents?

## Post-Research Follow-up Interview

### Overview
"We've completed our comprehensive analysis and I'd like to review our key findings with you to ensure we're aligned on the best path forward."

### Vision Alignment Questions

**Market & Business Findings:**
- Our research shows [market opportunity of $X with Y growth rate]. How does this align with your expectations?
- We've identified [target customer segment] as the primary market. Does this match your vision?
- The competitive analysis suggests [positioning strategy]. Are you comfortable with this approach?
- Financial projections indicate [ROI timeline and metrics]. Does this meet your business objectives?

**Technical Recommendations:**
- We've identified [technical approach/architecture] as optimal for your needs. Does this match your expectations?
- Our analysis suggests using [technology stack]. Are you open to these technologies?
- We found [technical debt/issues] that need addressing. How important is resolving these to you?
- The recommended approach would require [team/skill requirements]. Is this feasible?

**Strategic Pivots or Enhancements:**
- Based on our analysis, we see an opportunity to [pivot/enhancement]. Are you open to this direction?
- The data suggests focusing on [different feature set/market]. How do you feel about this?
- We've identified [risk or challenge] that wasn't initially apparent. How should we address this?

**Security & Compliance:**
- Security analysis recommends [security approach/framework]. Is this acceptable for your compliance needs?
- We've identified [compliance requirements] that will impact the architecture. Are you prepared for these?
- The security assessment found [vulnerabilities/risks]. What's your risk tolerance here?

**Timeline & Resources:**
- Based on our analysis, realistic timeline would be [X months]. Does this work for you?
- The recommended approach would require [budget estimate]. Is this within your constraints?
- We suggest a team structure of [composition]. Can you support this?

### Direction Confirmation

**Final Alignment:**
- Given all our findings, do you want to proceed with the recommended approach?
- Are there any aspects of our analysis that concern you or that you'd like to modify?
- What adjustments to our recommendations would better align with your vision?
- What are your top 3 priorities based on what you've learned?

**Next Steps:**
- Are you ready to proceed to the requirements phase with this direction?
- Do you need time to consider these findings with other stakeholders?
- Are there any additional constraints or requirements that have emerged from this discussion?

## Interview Best Practices

### For the Interviewer (Project Analyzer Agent)

1. **Be Conversational**: Make it feel like a discussion, not an interrogation
2. **Listen Actively**: Pay attention to what's not being said
3. **Clarify Ambiguity**: Ask follow-up questions when answers are vague
4. **Document Everything**: Even seemingly minor details can be important
5. **Stay Neutral**: Don't judge or critique during the interview
6. **Respect Time**: Keep the interview focused and efficient
7. **Summarize Key Points**: Confirm understanding before moving on

### Handling Non-Responses

If stakeholder skips questions or provides minimal answers:
- Document "No response provided" for skipped questions
- Note which areas the stakeholder seems less concerned about
- Use available information to make reasonable assumptions (documented as such)
- Flag areas where lack of information might impact analysis quality

### Documentation Format

For each question category, create a structured document:
```markdown
# [Category Name] - Stakeholder Interview Response

**Interview Date**: [Date]
**Stakeholder**: [Name/Role]
**Project**: [Project Name]

## Questions & Responses

### Question: [Question text]
**Response**: [Stakeholder's answer]
**Follow-up**: [Any follow-up Q&A]
**Notes**: [Interviewer observations]

### Question: [Next question]
**Response**: [No response provided] 
**Notes**: Stakeholder indicated this was not a concern

## Key Takeaways
- [Important point 1]
- [Important point 2]
- [Important point 3]

## Areas Requiring Clarification
- [Unclear point 1]
- [Assumption made due to lack of info]
```

## Integration with Agent Workflows

### How Agents Should Use This Information

1. **Research Agent**: Align market research with stated business objectives
2. **Marketing Agent**: Focus strategies on identified target users and pain points
3. **Finance Agent**: Use budget constraints and ROI expectations for projections
4. **PRD Agent**: Prioritize features based on stakeholder priorities
5. **Security Agent**: Implement compliance requirements from the start
6. **Coder Agent**: Follow technical preferences and architectural constraints
7. **DevOps Agent**: Design deployment based on environment requirements
8. **All Agents**: Reference vision alignment when making recommendations

### Context Optimization

Store responses in structured JSON for efficient agent consumption:
```json
{
  "stakeholder_interview": {
    "project_context": {
      "business_objectives": "...",
      "target_users": "...",
      "success_metrics": "..."
    },
    "technical_scope": {
      "current_stack": [...],
      "preferences": [...],
      "constraints": [...]
    },
    "priorities": {
      "immediate": [...],
      "short_term": [...],
      "long_term": [...]
    },
    "vision_alignment": {
      "aligned_aspects": [...],
      "divergent_aspects": [...],
      "adjustments_needed": [...]
    }
  }
}
```

This structured approach ensures all agents work with consistent stakeholder context and can make informed decisions aligned with the stakeholder's vision.