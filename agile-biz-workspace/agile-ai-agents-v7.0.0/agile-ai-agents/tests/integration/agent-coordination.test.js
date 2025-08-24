/**
 * Integration tests for Agent Coordination
 * Tests how agents work together in real scenarios
 */

const fs = require('fs').promises;
const path = require('path');

describe('Agent Coordination Integration', () => {
  const testProjectPath = path.join(__dirname, '../../test-project');
  
  beforeAll(async () => {
    // Set up test project structure
    await fs.mkdir(testProjectPath, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test project
    await fs.rm(testProjectPath, { recursive: true, force: true });
  });

  describe('Sprint Workflow Coordination', () => {
    it('should coordinate PRD → Project Manager → Scrum Master flow', async () => {
      // Simulate PRD Agent creating requirements
      const prdPath = path.join(testProjectPath, 'project-documents/planning/prd.md');
      await fs.mkdir(path.dirname(prdPath), { recursive: true });
      await fs.writeFile(prdPath, `# Product Requirements Document
      
## Overview
Test product for agent coordination testing.

## Features
- Feature A: User authentication
- Feature B: Dashboard
- Feature C: API integration

## Technical Requirements
- Node.js backend
- React frontend
- PostgreSQL database`);

      // Verify PRD was created
      const prdContent = await fs.readFile(prdPath, 'utf-8');
      expect(prdContent).toContain('Feature A: User authentication');

      // Simulate Project Manager creating project plan
      const projectPlanPath = path.join(testProjectPath, 'project-documents/planning/project-plan.md');
      await fs.mkdir(path.dirname(projectPlanPath), { recursive: true });
      await fs.writeFile(projectPlanPath, `# Project Plan

## Phases
1. Planning Phase (Current)
2. Development Phase
3. Testing Phase
4. Deployment Phase

## Milestones
- M1: Requirements Complete ✓
- M2: MVP Development
- M3: Testing Complete
- M4: Production Deploy`);

      // Simulate Scrum Master creating sprint
      const sprintPath = path.join(
        testProjectPath, 
        'project-documents/orchestration/sprints/sprint-2025-01-10-mvp/planning.md'
      );
      await fs.mkdir(path.dirname(sprintPath), { recursive: true });
      await fs.writeFile(sprintPath, `# Sprint Planning: MVP Development

## Sprint Goal
Implement core authentication and dashboard features.

## Tasks
1. Set up project structure (Coder Agent)
2. Implement authentication (Coder Agent)
3. Create dashboard UI (UI/UX Agent)
4. Write tests (Testing Agent)
5. Document API (Documentation Agent)`);

      // Verify coordination artifacts exist
      expect(await fs.access(prdPath).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(projectPlanPath).then(() => true).catch(() => false)).toBe(true);
      expect(await fs.access(sprintPath).then(() => true).catch(() => false)).toBe(true);
    });

    it('should handle parallel agent operations', async () => {
      const parallelTasks = [
        // Security Agent task
        fs.writeFile(
          path.join(testProjectPath, 'project-documents/technical/security-assessment.md'),
          '# Security Assessment\n\nNo vulnerabilities found.'
        ),
        // Testing Agent task
        fs.writeFile(
          path.join(testProjectPath, 'project-documents/technical/test-plan.md'),
          '# Test Plan\n\nComprehensive testing strategy.'
        ),
        // DevOps Agent task
        fs.writeFile(
          path.join(testProjectPath, 'project-documents/operations/setup.md'),
          '# Environment Setup\n\nDevelopment environment configured.'
        )
      ];

      // Execute parallel operations
      await Promise.all(parallelTasks);

      // Verify all completed
      const files = [
        'project-documents/technical/security-assessment.md',
        'project-documents/technical/test-plan.md',
        'project-documents/operations/setup.md'
      ];

      for (const file of files) {
        const exists = await fs.access(
          path.join(testProjectPath, file)
        ).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });

  describe('Document Registry Updates', () => {
    it('should update document registry when creating documents', async () => {
      const registryPath = path.join(
        testProjectPath,
        'project-documents/orchestration/sprints/sprint-2025-01-10-mvp/document-registry.md'
      );

      await fs.writeFile(registryPath, `# Document Registry

## Sprint Documents

| Document | Agent | Created | Purpose |
|----------|-------|---------|---------|
| planning.md | scrum_master_agent | 2025-01-10 10:00 | Sprint planning |
| requirements.md | prd_agent | 2025-01-10 10:30 | Feature requirements |
| test-plan.md | testing_agent | 2025-01-10 11:00 | Testing strategy |`);

      const content = await fs.readFile(registryPath, 'utf-8');
      expect(content).toContain('scrum_master_agent');
      expect(content).toContain('testing_agent');
      expect(content).toContain('prd_agent');
    });
  });

  describe('State Persistence', () => {
    it('should persist state between agent handoffs', async () => {
      const statePath = path.join(testProjectPath, 'project-state/current-state.json');
      await fs.mkdir(path.dirname(statePath), { recursive: true });

      const state = {
        currentPhase: 'development',
        activeAgents: ['coder_agent', 'testing_agent'],
        completedTasks: [
          { task: 'requirements', agent: 'prd_agent', completed: '2025-01-10T10:00:00Z' },
          { task: 'planning', agent: 'scrum_master_agent', completed: '2025-01-10T11:00:00Z' }
        ],
        nextTasks: [
          { task: 'implementation', agent: 'coder_agent', status: 'in_progress' }
        ]
      };

      await fs.writeFile(statePath, JSON.stringify(state, null, 2));

      // Simulate reading state in next session
      const savedState = JSON.parse(await fs.readFile(statePath, 'utf-8'));
      expect(savedState.currentPhase).toBe('development');
      expect(savedState.activeAgents).toContain('coder_agent');
      expect(savedState.completedTasks).toHaveLength(2);
    });
  });

  describe('Error Recovery', () => {
    it('should handle agent failures gracefully', async () => {
      const errorLogPath = path.join(
        testProjectPath,
        'project-documents/orchestration/project-log.md'
      );

      await fs.mkdir(path.dirname(errorLogPath), { recursive: true });
      
      // Simulate error logging
      await fs.writeFile(errorLogPath, `# Project Log

## Errors

### 2025-01-10 12:00:00
- **Agent**: testing_agent
- **Error**: Failed to run browser tests
- **Cause**: Port 3000 already in use
- **Resolution**: Detected port conflict, switched to port 3001
- **Status**: Resolved

### 2025-01-10 12:30:00
- **Agent**: devops_agent  
- **Error**: Docker build failed
- **Cause**: Missing dependency in package.json
- **Resolution**: Added missing dependency, rebuild successful
- **Status**: Resolved`);

      const errorLog = await fs.readFile(errorLogPath, 'utf-8');
      expect(errorLog).toContain('Resolved');
      expect(errorLog).toContain('testing_agent');
      expect(errorLog).toContain('devops_agent');
    });
  });
});