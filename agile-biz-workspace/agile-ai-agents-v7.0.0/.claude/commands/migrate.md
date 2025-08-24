---
allowed-tools: [Task]
argument-hint: Migration type or system to migrate
---

# Migrate

Execute system migrations including data, infrastructure, technology stack, or platform migrations with comprehensive planning and risk management.

## Usage

```
/migrate [migration-type]
```

**Examples:**
- `/migrate database` - Database migration or schema changes
- `/migrate cloud-platform` - Cloud provider migration
- `/migrate framework` - Technology framework migration
- `/migrate legacy-system` - Legacy system modernization

## What This Does

1. **Migration Planning**: Comprehensive migration strategy and timeline
2. **Risk Assessment**: Identify and mitigate migration risks
3. **Data Migration**: Secure data transfer with integrity validation
4. **System Migration**: Infrastructure and application migration
5. **Validation and Testing**: Ensure migration success and quality

## Migration Analysis and Planning

### Migration Requirements Assessment
```markdown
## Migration Requirements Analysis

**Migration Type**: [Database/Infrastructure/Platform/Framework/Legacy]
**Business Driver**: [Why migration is needed]
**Timeline**: [Preferred completion date]
**Criticality**: [Business critical/Important/Nice-to-have]

### Current System State
**Source System**:
- **Technology Stack**: [Current technologies and versions]
- **Architecture**: [System architecture overview]
- **Data Volume**: [Amount of data to migrate]
- **Dependencies**: [System dependencies and integrations]
- **Performance Baseline**: [Current performance metrics]
- **Known Issues**: [Existing problems or limitations]

**Infrastructure**:
- **Hardware/Cloud**: [Current hosting and infrastructure]
- **Network**: [Network configuration and dependencies]
- **Security**: [Current security implementation]
- **Backup/DR**: [Current backup and disaster recovery]

### Target System Requirements
**Destination System**:
- **Technology Stack**: [Target technologies and versions]
- **Architecture**: [Desired system architecture]
- **Performance Targets**: [Expected performance improvements]
- **Scalability Requirements**: [Growth expectations]
- **Security Requirements**: [Enhanced security needs]
- **Compliance**: [Regulatory or compliance requirements]

**Business Requirements**:
- **Functional Requirements**: [Features that must be maintained/improved]
- **Non-functional Requirements**: [Performance, security, availability]
- **User Experience**: [UX improvements or changes]
- **Integration Requirements**: [System integrations to maintain]
```

## Migration Strategy and Approach

### Migration Strategy Selection
```markdown
## Migration Strategy

### Approach Analysis
**Migration Strategies Considered**:

1. **Big Bang Migration**
   - **Description**: Complete migration in single cutover
   - **Pros**: [Advantages]
   - **Cons**: [Disadvantages]
   - **Risk Level**: [High/Medium/Low]
   - **Recommended For**: [When appropriate]

2. **Phased Migration**
   - **Description**: Gradual migration in phases
   - **Pros**: [Advantages]
   - **Cons**: [Disadvantages]  
   - **Risk Level**: [High/Medium/Low]
   - **Recommended For**: [When appropriate]

3. **Parallel Migration**
   - **Description**: Run both systems in parallel
   - **Pros**: [Advantages]
   - **Cons**: [Disadvantages]
   - **Risk Level**: [High/Medium/Low]
   - **Recommended For**: [When appropriate]

**Selected Strategy**: [Chosen approach]
**Rationale**: [Why this strategy was selected]

### Migration Phases
**Phase 1: Preparation and Setup**
- **Duration**: [Timeframe]
- **Objectives**: [What to accomplish]
- **Key Activities**:
  - [Activity 1]: [Description]
  - [Activity 2]: [Description]
- **Success Criteria**: [How to measure success]
- **Dependencies**: [Prerequisites]

**Phase 2: Data Migration**
- **Duration**: [Timeframe]
- **Objectives**: [Data migration goals]
- **Key Activities**:
  - [Data assessment and cleanup]
  - [Migration tool setup and testing]
  - [Data transformation and validation]
- **Success Criteria**: [Data integrity and completeness metrics]

**Phase 3: Application Migration**
- **Duration**: [Timeframe]
- **Objectives**: [Application migration goals]
- **Key Activities**:
  - [Code migration and refactoring]
  - [Configuration and integration]
  - [Testing and validation]
- **Success Criteria**: [Functionality and performance criteria]

**Phase 4: Cutover and Go-Live**
- **Duration**: [Timeframe]
- **Objectives**: [Go-live goals]
- **Key Activities**:
  - [Final data sync]
  - [DNS/traffic cutover]
  - [User communication and training]
- **Success Criteria**: [System availability and user acceptance]
```

## Data Migration Planning

### Data Assessment and Mapping
```markdown
## Data Migration Plan

### Data Inventory
**Source Data Assessment**:
| Data Type | Volume | Quality | Complexity | Migration Priority |
|-----------|---------|---------|------------|-------------------|
| [User Data] | [Size] | [High/Med/Low] | [Complex/Medium/Simple] | [Critical/High/Medium] |
| [Transaction Data] | [Size] | [High/Med/Low] | [Complex/Medium/Simple] | [Critical/High/Medium] |
| [Configuration Data] | [Size] | [High/Med/Low] | [Complex/Medium/Simple] | [Critical/High/Medium] |

### Data Mapping and Transformation
**Data Structure Changes**:
- **[Source Table/Collection]** → **[Target Table/Collection]**
  - **Mapping**: [Field mappings and transformations]
  - **Business Logic**: [Data transformation rules]
  - **Validation Rules**: [Data quality checks]

### Data Quality Assessment
**Data Quality Issues**:
1. **[Issue Type]**: [Description]
   - **Impact**: [Effect on migration]
   - **Cleanup Plan**: [How to address]
   - **Timeline**: [When to resolve]

**Data Cleansing Plan**:
- **Pre-migration Cleanup**: [Data quality improvements]
- **During Migration**: [Real-time data validation]
- **Post-migration Verification**: [Data integrity checks]

### Migration Tools and Scripts
**Migration Toolset**:
- **Primary Tool**: [Tool name and purpose]
- **Backup Method**: [Alternative approach]
- **Custom Scripts**: [Custom migration code needed]
- **Validation Tools**: [Data verification tools]

**Migration Scripts**:
```sql
-- Example migration script structure
-- Data extraction
SELECT [fields] FROM [source_table] 
WHERE [conditions];

-- Data transformation
-- [Transformation logic]

-- Data loading
INSERT INTO [target_table] 
([fields]) VALUES ([transformed_data]);

-- Validation queries
SELECT COUNT(*) FROM [source_table];
SELECT COUNT(*) FROM [target_table];
```
```

## Technical Migration Implementation

### Infrastructure Migration
```markdown
## Infrastructure Migration Plan

### Environment Setup
**Target Infrastructure**:
- **Compute Resources**: [Server/instance specifications]
- **Storage**: [Database and file storage requirements]
- **Network**: [Network configuration and security]
- **Load Balancing**: [Traffic distribution setup]
- **Security**: [Firewall, SSL, authentication setup]

**Environment Provisioning**:
1. **Development Environment**
   - **Purpose**: [Testing and validation]
   - **Configuration**: [Specific setup requirements]
   - **Timeline**: [When to provision]

2. **Staging Environment**
   - **Purpose**: [Pre-production testing]
   - **Configuration**: [Production-like setup]
   - **Timeline**: [When to provision]

3. **Production Environment**
   - **Purpose**: [Live system]
   - **Configuration**: [Full production specs]
   - **Timeline**: [When to provision]

### Application Migration
**Code Migration Tasks**:
- [ ] **Source Code Analysis**: [Compatibility assessment]
- [ ] **Dependency Updates**: [Library and framework updates]
- [ ] **Configuration Changes**: [Environment-specific configs]
- [ ] **API Compatibility**: [Integration point verification]
- [ ] **Performance Optimization**: [Code optimization for target platform]

**Deployment Pipeline**:
- **Build Process**: [How code is built for target platform]
- **Testing Process**: [Automated testing in new environment]
- **Deployment Process**: [How code is deployed]
- **Rollback Process**: [How to revert if issues occur]
```

### Database Migration Specifics
```markdown
## Database Migration Details

### Schema Migration
**Schema Changes Required**:
- **Table Structures**: [Changes to table definitions]
- **Indexes**: [Index modifications and additions]
- **Stored Procedures**: [Procedure updates or replacements]
- **Views**: [View modifications]
- **Constraints**: [Constraint changes]

**Migration Script Structure**:
```sql
-- Schema creation
CREATE TABLE [new_table] (
    [field_definitions]
);

-- Data migration
INSERT INTO [new_table] 
SELECT [transformed_fields] FROM [old_table];

-- Index creation
CREATE INDEX [index_name] ON [table] ([fields]);

-- Verification
SELECT COUNT(*) FROM [old_table];
SELECT COUNT(*) FROM [new_table];
```

### Database Migration Process
**Step-by-Step Process**:
1. **Pre-Migration Backup**
   - Full database backup
   - Transaction log backup
   - Backup verification

2. **Schema Migration**
   - Create new schema objects
   - Verify schema structure
   - Test with sample data

3. **Data Migration**
   - Extract data from source
   - Transform data as needed
   - Load data to target
   - Verify data integrity

4. **Post-Migration Tasks**
   - Update statistics
   - Rebuild indexes
   - Test application connectivity
   - Performance verification
```

## Risk Management and Mitigation

### Migration Risks Assessment
```markdown
## Risk Analysis and Mitigation

### High-Risk Areas
1. **Data Loss Risk**
   - **Risk**: [Description of data loss scenarios]
   - **Impact**: [Business impact if occurs]
   - **Probability**: [Likelihood assessment]
   - **Mitigation**: [Prevention strategies]
   - **Contingency**: [Response plan if occurs]

2. **Downtime Risk**
   - **Risk**: [Extended system unavailability]
   - **Impact**: [Business impact of downtime]
   - **Mitigation**: [Strategies to minimize downtime]
   - **Communication Plan**: [How to inform stakeholders]

3. **Performance Degradation**
   - **Risk**: [System performance issues]
   - **Impact**: [User experience degradation]
   - **Mitigation**: [Performance testing and optimization]
   - **Monitoring Plan**: [How to detect and respond]

### Risk Mitigation Strategies
**Technical Mitigation**:
- **Comprehensive Testing**: [Testing strategy across all environments]
- **Rollback Planning**: [Quick rollback procedures]
- **Backup Strategy**: [Multiple backup points and verification]
- **Monitoring**: [Real-time monitoring during migration]

**Process Mitigation**:
- **Change Management**: [Controlled change process]
- **Communication**: [Clear stakeholder communication]
- **Training**: [Team training on new systems]
- **Documentation**: [Comprehensive documentation]

### Contingency Planning
**Rollback Procedures**:
1. **Immediate Rollback** (Critical Issues)
   - [Steps to quickly revert to previous system]
   - [Data consistency considerations]
   - [Communication procedures]

2. **Planned Rollback** (Systematic Issues)
   - [Comprehensive rollback process]
   - [Data reconciliation steps]
   - [Stakeholder notification]

**Emergency Contacts**:
- **Technical Lead**: [Name and contact]
- **Business Owner**: [Name and contact]
- **Infrastructure Team**: [Name and contact]
- **External Vendor**: [Name and contact] (if applicable)
```

## Testing and Validation

### Migration Testing Strategy
```markdown
## Testing and Validation Plan

### Testing Phases
**Pre-Migration Testing**:
- **Migration Tool Testing**: [Test migration scripts and tools]
- **Environment Testing**: [Verify target environment setup]
- **Performance Baseline**: [Establish baseline metrics]
- **Security Testing**: [Verify security implementations]

**During Migration Testing**:
- **Data Integrity Checks**: [Real-time data validation]
- **Application Connectivity**: [Verify system connections]
- **Performance Monitoring**: [Monitor system performance]
- **Error Detection**: [Monitor for migration errors]

**Post-Migration Testing**:
- **Functional Testing**: [Verify all functionality works]
- **Integration Testing**: [Test system integrations]
- **Performance Testing**: [Validate performance improvements]
- **User Acceptance Testing**: [Stakeholder validation]

### Test Scenarios
**Critical Path Testing**:
1. **[Primary User Workflow]**
   - **Test Steps**: [Step-by-step testing procedure]
   - **Expected Results**: [What should happen]
   - **Pass Criteria**: [Success conditions]

2. **[Integration Scenario]**
   - **Test Steps**: [Integration testing steps]
   - **Expected Results**: [Integration outcomes]
   - **Error Handling**: [How errors should be handled]

### Data Validation
**Data Integrity Checks**:
- **Record Count Validation**: [Source vs target record counts]
- **Data Quality Validation**: [Field-level data verification]
- **Referential Integrity**: [Foreign key and relationship verification]
- **Business Logic Validation**: [Business rule compliance]

**Validation Queries**:
```sql
-- Record count comparison
SELECT 'Source Count', COUNT(*) FROM [source_table]
UNION ALL
SELECT 'Target Count', COUNT(*) FROM [target_table];

-- Data quality checks
SELECT [field], COUNT(*) 
FROM [target_table] 
WHERE [field] IS NULL OR [field] = '';

-- Business rule validation
SELECT COUNT(*) FROM [target_table] 
WHERE [business_condition];
```
```

## Cutover and Go-Live Planning

### Cutover Strategy
```markdown
## Migration Cutover Plan

### Cutover Timeline
**Pre-Cutover Activities** (Week before):
- [ ] Final testing completion
- [ ] Stakeholder communication
- [ ] Backup verification
- [ ] Team preparation and training
- [ ] Rollback procedure verification

**Cutover Day Schedule**:
**[Time]**: [Activity]
- **[08:00]**: Final pre-migration backup
- **[09:00]**: Begin data migration
- **[12:00]**: Data migration completion check
- **[13:00]**: Application deployment
- **[14:00]**: System integration testing
- **[15:00]**: User acceptance testing
- **[16:00]**: Go/No-Go decision
- **[17:00]**: User communication and go-live

### Go/No-Go Criteria
**Go Criteria**:
- [ ] All data successfully migrated and validated
- [ ] All critical functionality tested and working
- [ ] Performance meets or exceeds baseline
- [ ] All integrations functioning correctly
- [ ] Rollback procedures verified and ready
- [ ] Stakeholder approval received

**No-Go Criteria**:
- Data integrity issues discovered
- Critical functionality not working
- Performance significantly degraded
- Integration failures
- Security vulnerabilities identified
- Stakeholder concerns not resolved

### Communication Plan
**Stakeholder Communication**:
- **Pre-Migration**: [Communication timeline and content]
- **During Migration**: [Progress updates and contact info]
- **Post-Migration**: [Success confirmation and next steps]

**User Communication**:
- **Advance Notice**: [How users are informed of changes]
- **Training Materials**: [Resources for learning new system]
- **Support Channels**: [Where to get help]
```

## Post-Migration Activities

### Post-Migration Validation
```markdown
## Post-Migration Checklist

### Immediate Post-Migration (First 24 Hours)
- [ ] **System Health Check**: All services running and responding
- [ ] **Data Integrity Verification**: Sample data checks across all tables
- [ ] **Performance Monitoring**: Response times and throughput measurement
- [ ] **Error Rate Monitoring**: Watch for increased error rates
- [ ] **User Feedback Collection**: Gather initial user reports
- [ ] **Integration Verification**: All external integrations working

### Short-term Monitoring (First Week)
- [ ] **Performance Trend Analysis**: Compare against baseline metrics
- [ ] **User Adoption Tracking**: Monitor feature usage and adoption
- [ ] **Support Ticket Analysis**: Identify common user issues
- [ ] **Business Metric Tracking**: Monitor key business indicators
- [ ] **System Stability Assessment**: Identify any stability issues

### Medium-term Assessment (First Month)
- [ ] **ROI Analysis**: Measure business value achieved
- [ ] **Performance Optimization**: Identify and implement improvements
- [ ] **User Satisfaction Survey**: Formal feedback collection
- [ ] **Process Documentation Update**: Refine operational procedures
- [ ] **Lessons Learned Documentation**: Capture migration insights
```

### Success Metrics and Reporting
```markdown
## Migration Success Measurement

### Technical Success Metrics
| Metric | Baseline | Target | Actual | Status |
|--------|----------|---------|---------|--------|
| System Availability | [%] | [%] | [%] | [Status] |
| Response Time | [ms] | [ms] | [ms] | [Status] |
| Error Rate | [%] | [%] | [%] | [Status] |
| Data Integrity | [%] | 100% | [%] | [Status] |

### Business Success Metrics  
| Metric | Baseline | Target | Actual | Status |
|--------|----------|---------|---------|--------|
| User Satisfaction | [Score] | [Target] | [Actual] | [Status] |
| Feature Adoption | [%] | [%] | [%] | [Status] |
| Support Tickets | [Count] | [Target] | [Actual] | [Status] |
| Business Value | [Measure] | [Target] | [Actual] | [Status] |

### Migration Efficiency Metrics
- **Migration Time**: [Actual vs Planned]
- **Budget**: [Actual vs Budgeted]
- **Resource Utilization**: [Efficiency of team time]
- **Issue Resolution**: [Speed of problem resolution]
```

### Documentation and Knowledge Transfer
```markdown
## Post-Migration Documentation

### Updated Documentation
- [ ] **System Architecture**: Updated architecture diagrams
- [ ] **Operational Procedures**: New operational runbooks
- [ ] **User Guides**: Updated user documentation
- [ ] **API Documentation**: Updated integration documentation
- [ ] **Security Documentation**: Updated security procedures
- [ ] **Disaster Recovery**: Updated DR procedures

### Knowledge Transfer
**Technical Team Training**:
- **New System Training**: [Training on new platform/technology]
- **Operational Procedures**: [New maintenance and monitoring procedures]
- **Troubleshooting**: [Common issues and resolution procedures]

**User Training**:
- **Feature Training**: [New or changed functionality]
- **Workflow Training**: [Updated business processes]
- **Support Resources**: [Help documentation and contact information]

### Lessons Learned
**Migration Successes**:
- [What worked well during migration]
- [Strategies that were particularly effective]
- [Tools or processes that exceeded expectations]

**Areas for Improvement**:
- [What could have been done better]
- [Process improvements for future migrations]
- [Tool or skill gaps that were identified]

**Future Recommendations**:
- [Recommendations for similar future migrations]
- [Process improvements to implement]
- [Training or resource needs identified]
```

## Follow-up Actions

After migration completion:
- `/deployment-success` - Document successful migration
- `/performance-report` - Generate post-migration performance analysis
- `/capture-learnings` - Document migration lessons learned
- Monitor system health and user feedback
- Plan optimization improvements based on performance data
- Schedule migration retrospective with team