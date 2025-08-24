# Security Guidelines for Community Contributions

## Overview

When contributing learnings to AgileAiAgents, it's essential to protect sensitive information while still sharing valuable insights. This guide helps ensure your contributions are safe to share publicly.

## What to Remove or Anonymize

### 1. Company Information
- **Company Names**: Replace with "[Industry] Company" (e.g., "[Healthcare] Company")
- **Product Names**: Use generic descriptions (e.g., "task management platform")
- **Internal Project Codenames**: Replace with descriptive names

### 2. Financial Data
- **Specific Revenue**: Use ranges instead
  - Under $1K
  - $1K-10K
  - $10K-100K
  - $100K-1M
  - $1M-10M
  - $10M+
- **User Numbers**: Use ranges
  - Under 100
  - 100-1000
  - 1K-10K
  - 10K-100K
  - 100K-1M
  - 1M+
- **Costs/Budgets**: Use percentages or ranges

### 3. Personal Information
- **Names**: Replace with roles (e.g., "Lead Developer", "Product Manager")
- **Email Addresses**: Use example@example.com
- **Phone Numbers**: Remove completely
- **Social Media Handles**: Remove or generalize

### 4. Technical Secrets
- **API Keys**: Never include, even partial
- **Passwords/Secrets**: Remove all references
- **Database Credentials**: Remove completely
- **OAuth Tokens**: Remove all traces
- **Private URLs**: Replace with example.com
- **Internal IPs**: Replace with standard examples (192.168.1.1)

### 5. Infrastructure Details
- **Server Names**: Use generic names (server1, api-server)
- **Cloud Account IDs**: Remove completely
- **Specific Configurations**: Generalize or remove
- **Security Group IDs**: Remove
- **VPC/Network Details**: Generalize

## Automated Privacy Scanning

AgileAiAgents includes an automated privacy scanner that checks for:

1. **API Keys and Tokens**
   - Generic long strings (32+ characters)
   - Known patterns (sk_*, ghp_*, AIza*)
   - UUIDs

2. **Secrets and Credentials**
   - Password patterns
   - Secret/token assignments
   - API key assignments

3. **URLs and IPs**
   - Internal domains (.internal, .local, .corp)
   - IP addresses
   - Localhost references

4. **Contact Information**
   - Email addresses
   - Potential names (Title Case patterns)

5. **Financial Data**
   - Dollar amounts
   - Credit card patterns
   - SSN patterns

## How to Use the Scanner

### During Generation
The scanner automatically runs when you generate contribution files:
```bash
npm run generate-contribution
```

### Manual Scanning
To scan existing files:
```bash
node machine-data/privacy-scanner.js scan <contribution-path>
```

### Reviewing Results
1. Check `privacy-scan-report.json` in your contribution folder
2. Review each finding:
   - **CRITICAL**: Must fix before submitting
   - **WARNING**: Should review and likely fix
   - **INFO**: Consider fixing based on context

## Best Practices

### 1. Review Before Submission
- Always manually review generated files
- Look for context-specific sensitive data the scanner might miss
- Consider what could identify your organization

### 2. Focus on Learnings, Not Details
- Share patterns and insights, not specific implementations
- Describe problems and solutions generically
- Use percentages instead of absolute numbers

### 3. Test Your Anonymization
- Would a competitor recognize your company?
- Could someone identify specific individuals?
- Are any trade secrets exposed?

### 4. When in Doubt, Remove
- If unsure whether something is sensitive, remove it
- Better to be overly cautious
- You can always add context in general terms

## Examples of Good Anonymization

### Before:
```markdown
Acme Corp's TaskMaster Pro platform grew from 50 users to 50,000 users, 
generating $2.5M ARR. Contact John Smith (john.smith@acme.com) for details.
```

### After:
```markdown
[Productivity] Company's task management platform grew from Under 100 to 
10K-100K users, generating $1M-10M ARR. Platform showed 1000x user growth.
```

### Before:
```markdown
We integrated with Stripe using API key sk_live_4242424242424242 
and deployed to https://api.taskmaster.internal.acme.com
```

### After:
```markdown
We integrated with a payment processor using environment variables
and deployed to our internal API server at https://api.example.com
```

## Contribution Checklist

Before submitting your contribution:

- [ ] Run the privacy scanner and address all findings
- [ ] Manually review both files for sensitive data
- [ ] Replace all company/product names
- [ ] Convert specific numbers to ranges
- [ ] Remove all credentials and secrets
- [ ] Generalize URLs and infrastructure details
- [ ] Remove personal contact information
- [ ] Verify learnings are still valuable after anonymization

## Questions?

If you're unsure about what to anonymize or have questions about the privacy scanner, please:
1. Open an issue on GitHub
2. Ask in discussions before submitting
3. Err on the side of caution

Remember: The goal is to share valuable learnings while protecting sensitive information. When done right, your anonymized contribution will help the entire AgileAiAgents community without exposing any confidential details.