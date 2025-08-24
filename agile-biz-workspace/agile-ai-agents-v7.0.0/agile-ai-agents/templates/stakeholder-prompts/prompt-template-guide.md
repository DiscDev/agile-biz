# Stakeholder Prompt Template Guide

## Overview

The Stakeholder Prompt Template system allows you to prepare comprehensive project information before your AgileAiAgents interview. This results in better project outcomes through more thoughtful inputs and saves significant time during the discovery process.

## Benefits

1. **Time to Think**: Take as long as you need to craft thoughtful answers
2. **Team Collaboration**: Multiple stakeholders can contribute to one document
3. **Reduced Interview Time**: 70% faster stakeholder interviews
4. **Better Outcomes**: Higher quality inputs lead to better project results
5. **Reference Document**: Your prompt becomes part of project documentation

## How It Works

### 1. Choose Your Template

We provide two templates based on your project type:

- **New Project**: `templates/stakeholder-prompts/universal-project-prompt.md`
- **Existing Project Enhancement**: `templates/stakeholder-prompts/existing-project-prompt.md`

### 2. Fill Out the Template

#### Using Google Docs (Recommended)
1. Copy the template content into a new Google Doc
2. Fill out all sections collaboratively with your team
3. Use the commenting feature for discussions
4. Export as Markdown when complete (File → Download → Markdown)

#### Direct Markdown Editing
1. Copy the template to your project
2. Edit using any text editor
3. Save as `project-prompt.md`

### 3. Quality Scoring

Your prompt will be automatically scored on completeness and quality:

- **90-100**: Excellent - Minimal clarification needed
- **70-89**: Good - Some clarification helpful
- **50-69**: Adequate - Significant clarification needed
- **Below 50**: Needs Work - Major gaps to fill

Key scoring factors:
- Clear one-sentence description
- 5+ specific NOT THIS items
- Detailed user personas
- Measurable success metrics
- Technical requirements clarity

### 4. Integration with Workflows

When you run `/start-new-project-workflow` or `/start-existing-project-workflow`:

1. **Prompt Detection**: System asks if you have a prompt file
2. **File Validation**: Checks format and completeness
3. **Quality Score**: Shows your score with feedback
4. **Progressive Review**: Reviews each section with you
5. **Gap Filling**: Asks only unanswered questions
6. **Context Integration**: Your inputs feed directly into:
   - Project Truth document
   - Context verification rules
   - Success monitoring metrics
   - Architecture decisions

## Template Sections Explained

### Critical Sections (Required)

#### 1. Project Vision
- **One-sentence description**: Keep it under 200 characters
- **Problem statement**: Include metrics if possible
- **Future vision**: Paint a 3-year picture

#### 2. Boundaries - NOT THIS List
- **Minimum 5 items**: More is better for clarity
- **Be specific**: "NOT a social media platform" vs "NOT social"
- **Include scope limits**: Features, users, integrations
- **This prevents drift**: Most critical section for focus

#### 3. Target Users
- **Named personas**: Give them names and roles
- **Specific demographics**: Age, location, tech level
- **Day-in-life scenarios**: How they'll actually use it
- **Pain points**: Current frustrations to solve

#### 4. Success Metrics
- **Measurable goals**: Include numbers and percentages
- **Time-bound targets**: 6-month, 1-year milestones
- **Quality metrics**: Performance, reliability standards
- **Growth indicators**: User adoption, revenue targets

### Optional Sections

Include based on your project type:
- **SaaS**: Subscription model, multi-tenancy, churn strategy
- **Mobile**: Platform priority, offline needs, device features
- **E-commerce**: Catalog size, payment methods, shipping
- **API**: Consumer types, rate limits, versioning
- **Enterprise**: Compliance, integrations, user management

## Best Practices

### DO:
- ✅ Be specific and detailed
- ✅ Include numbers and metrics
- ✅ Focus heavily on NOT THIS items
- ✅ Involve multiple stakeholders
- ✅ Review examples before starting
- ✅ Take time to be thoughtful

### DON'T:
- ❌ Rush through sections
- ❌ Use vague language ("better", "easier")
- ❌ Skip the NOT THIS section
- ❌ Leave sections blank
- ❌ Copy competitor descriptions

## Examples

We provide filled examples showing best practices:
- `examples/b2b-saas-example.md` - TaskFlow Pro project
- `examples/existing-project-enhancement-example.md` - ArtisanMarket enhancement

Review these to understand the appropriate level of detail.

## Common Questions

**Q: How long should I spend on this?**
A: Most teams spend 1-2 hours for comprehensive coverage. The time invested pays back in reduced development time.

**Q: Can I update it later?**
A: Yes, your prompt can evolve. It becomes part of your project documentation.

**Q: What if I don't know some answers?**
A: Mark them as "TBD" or "Need research". The system will help during the interview.

**Q: Should technical and non-technical people collaborate?**
A: Absolutely! Different perspectives create better outcomes.

**Q: How detailed should the NOT THIS list be?**
A: Very detailed. This is your best defense against scope creep.

## Next Steps

1. **Download Template**: Choose new or existing project template
2. **Collaborate**: Work with your team to fill it out
3. **Review Examples**: See how others have done it
4. **Score Yourself**: Use the rubric to self-assess
5. **Save Location**: `project-documents/stakeholder-input/project-prompt.md`
6. **Run Workflow**: Start your project with `/start-new-project-workflow`

## Support

The Project Analyzer Agent will guide you through using your prompt file. If your score is below 70, the agent will help you improve weak sections during the interview process.

Remember: The better your inputs, the better your project outcome!