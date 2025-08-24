# Stakeholder Prompt Templates

## Overview

The Stakeholder Prompt Template system helps you provide comprehensive project information before starting your AgileAiAgents workflow. By preparing thoughtful answers in advance, you'll get better project outcomes and save significant time during the discovery process.

## Quick Start

1. **Choose Your Template**:
   - [New Project Template](universal-project-prompt.md) - For brand new projects
   - [Existing Project Template](existing-project-prompt.md) - For enhancing current systems

2. **Review Examples**:
   - [B2B SaaS Example](examples/b2b-saas-example.md) - TaskFlow Pro
   - [Mobile App Example](examples/mobile-fitness-app-example.md) - FitFlow
   - [Existing Project Example](examples/existing-project-enhancement-example.md) - ArtisanMarket

3. **Fill Out Your Template**:
   - Use Google Docs for collaboration ([Export Guide](google-docs-export-guide.md))
   - Or edit directly in Markdown
   - Aim for quality score of 70+ ([Scoring Rubric](prompt-quality-rubric.md))

4. **Save Your File**:
   ```
   project-documents/stakeholder-input/project-prompt.md
   ```

5. **Use in Workflow**:
   - Run `/start-new-project-workflow` or `/start-existing-project-workflow`
   - Answer "yes" when asked about prompt file
   - Provide the file path

## What's Included

### Templates
- `universal-project-prompt.md` - Comprehensive template for new projects
- `existing-project-prompt.md` - Specialized template for enhancements
- `ai-automated-business-prompt.md` - Extended template for AI-driven businesses (NEW)

### Documentation
- `prompt-template-guide.md` - Complete guide to using the system
- `prompt-quality-rubric.md` - Scoring system and quality metrics
- `google-docs-export-guide.md` - Step-by-step export instructions

### Examples
- `examples/b2b-saas-example.md` - B2B SaaS project (score: 92/100)
- `examples/mobile-fitness-app-example.md` - Consumer mobile app (score: 88/100)
- `examples/existing-project-enhancement-example.md` - Enhancement project (score: 85/100)
- `examples/ai-automated-business-example.md` - LegalFlow AI automated business (score: 95/100)

### Implementation
- `machine-data/validators/prompt-validator.js` - Validation and scoring logic

## Key Benefits

### For Stakeholders
- ⏰ **Time to Think**: No pressure to answer on the spot
- 👥 **Team Input**: Multiple people can contribute
- 📋 **Completeness**: Structured template ensures nothing missed
- 🎯 **Better Outcomes**: Thoughtful inputs → better projects

### For Development
- 🚀 **Faster Start**: Skip redundant questions
- 🎯 **Clear Focus**: NOT THIS list prevents scope creep
- 📊 **Measurable Goals**: Success metrics built in
- 🔄 **Integrated Flow**: Feeds directly into all workflows

## Quality Scoring

Your prompt is automatically scored:
- **90-100**: Excellent ✨
- **70-89**: Good ✅
- **50-69**: Adequate ⚠️
- **Below 50**: Needs Work ❌

Key factors:
- Clear vision (20 points)
- NOT THIS list (25 points)
- User definition (20 points)
- Success metrics (20 points)
- Technical clarity (15 points)
- Bonus points available (10 points)

## Integration with AgileAiAgents

### New Project Workflow
1. Prompt file detected and validated
2. Quality score displayed
3. Each section reviewed with confirmation
4. Missing sections addressed
5. Creates initial Project Truth for Context Verification
6. Feeds into research and requirements

### Existing Project Workflow
1. Current state documented
2. Enhancement goals clarified
3. Must NOT change items protected
4. Success metrics defined
5. Migration strategy planned

## Best Practices

### DO ✅
- Be specific and detailed
- Focus heavily on NOT THIS items
- Include measurable metrics
- Involve your whole team
- Review examples first
- Take your time

### DON'T ❌
- Rush through sections
- Use vague language
- Skip any required sections
- Copy from other projects
- Leave TBDs if possible

## Frequently Asked Questions

**Q: How long does this take?**
A: Most teams spend 1-2 hours for a comprehensive prompt. This investment saves 5-10 hours of development time.

**Q: Can I update it later?**
A: Yes! Your prompt becomes part of project documentation and can evolve.

**Q: What if I don't know something?**
A: Mark it as "TBD" or "Need research". The system will help during the interview.

**Q: Is this required?**
A: No, it's optional but highly recommended. You can always use the traditional interview.

**Q: Which template for a major rewrite?**
A: Use the existing project template - it handles major overhauls well.

## Support

Need help?
1. Review the examples for inspiration
2. Check the quality rubric for guidance
3. The Project Analyzer Agent will help during the interview
4. Your prompt can be refined iteratively

---

*Remember: The better your inputs, the better your project outcome. Take time to be thoughtful!*