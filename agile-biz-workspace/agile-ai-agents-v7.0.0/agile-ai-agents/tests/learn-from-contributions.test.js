/**
 * Tests for Learn From Contributions Command Handler
 * 
 * Tests all command variations and expected outputs
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the handler script
const HANDLER_PATH = path.join(__dirname, '../machine-data/scripts/learn-from-contributions-handler.js');
const CONTRIBUTIONS_DIR = path.join(__dirname, '../community-learnings/contributions');
const ARCHIVE_DIR = path.join(__dirname, '../community-learnings/archive');

describe('Learn From Contributions Handler', () => {
    
    // Helper to run the handler with arguments
    function runHandler(args = '') {
        try {
            const output = execSync(`node "${HANDLER_PATH}" ${args}`, {
                encoding: 'utf-8',
                env: { ...process.env, NODE_ENV: 'test' }
            });
            return { success: true, output };
        } catch (error) {
            return { 
                success: false, 
                output: error.stdout || '', 
                error: error.stderr || error.message 
            };
        }
    }

    describe('Basic Command Tests', () => {
        
        test('should run without arguments (interactive mode)', () => {
            const result = runHandler();
            expect(result.success).toBe(true);
            expect(result.output).toContain('Learning Analysis Agent - Interactive Mode');
        });

        test('should show help with --help flag', () => {
            const result = runHandler('--help');
            expect(result.success).toBe(true);
            expect(result.output).toContain('Usage: learn-from-contributions [option]');
            expect(result.output).toContain('--check-only');
            expect(result.output).toContain('--analyze');
            expect(result.output).toContain('--status');
        });

        test('should show help with -h flag', () => {
            const result = runHandler('-h');
            expect(result.success).toBe(true);
            expect(result.output).toContain('Usage: learn-from-contributions [option]');
        });

        test('should handle unknown options gracefully', () => {
            const result = runHandler('--unknown-option');
            expect(result.success).toBe(true);
            expect(result.output).toContain('Unknown option: --unknown-option');
        });
    });

    describe('Check-Only Tests', () => {
        
        test('should check for contributions with --check-only', () => {
            const result = runHandler('--check-only');
            expect(result.success).toBe(true);
            expect(result.output).toContain('Contribution Status');
            expect(result.output).toMatch(/Total contributions found: \d+/);
            expect(result.output).toMatch(/New contributions: \d+/);
        });

        test('should exclude examples folder', () => {
            const result = runHandler('--check-only');
            expect(result.success).toBe(true);
            // Should not include the example contribution
            expect(result.output).not.toContain('2025-01-27-saas-dashboard-example');
        });

        test('should show new contributions details if any exist', () => {
            const result = runHandler('--check-only');
            expect(result.success).toBe(true);
            
            // Check if there are new contributions
            if (result.output.includes('New contributions: 0')) {
                expect(result.output).toContain('All contributions have been analyzed');
            } else {
                expect(result.output).toContain('New Contributions:');
                expect(result.output).toContain('Path:');
                expect(result.output).toContain('Files:');
                expect(result.output).toContain('Created:');
            }
        });
    });

    describe('Status Command Tests', () => {
        
        test('should show comprehensive status with --status', () => {
            const result = runHandler('--status');
            expect(result.success).toBe(true);
            expect(result.output).toContain('Learning Analysis Status');
            expect(result.output).toContain('Statistics:');
            expect(result.output).toContain('Archive Status:');
            expect(result.output).toContain('Readiness:');
        });

        test('should show archive statistics', () => {
            const result = runHandler('--status');
            expect(result.success).toBe(true);
            expect(result.output).toMatch(/Implemented patterns: \d+/);
            expect(result.output).toMatch(/Rejected patterns: \d+/);
        });

        test('should show readiness indicator', () => {
            const result = runHandler('--status');
            expect(result.success).toBe(true);
            // Should have one of the readiness emojis
            expect(result.output).toMatch(/[✅🟡🔴]/);
        });
    });

    describe('Analyze Command Tests', () => {
        
        test('should run analysis with --analyze', () => {
            const result = runHandler('--analyze');
            expect(result.success).toBe(true);
            
            // Check for either no contributions or analysis output
            if (result.output.includes('No new contributions to analyze')) {
                expect(result.output).toContain('No new contributions to analyze');
            } else {
                expect(result.output).toContain('Starting Analysis...');
                expect(result.output).toContain('Analysis report saved to:');
                expect(result.output).toContain('Next Steps:');
            }
        });

        test('should create analysis report directory if needed', () => {
            const result = runHandler('--analyze');
            expect(result.success).toBe(true);
            
            // Check if analysis reports directory exists after running
            const analysisDir = path.join(__dirname, '../project-documents/analysis-reports');
            if (!result.output.includes('No new contributions')) {
                expect(fs.existsSync(analysisDir)).toBe(true);
            }
        });
    });

    describe('File System Tests', () => {
        
        test('should handle missing contributions directory gracefully', () => {
            // Temporarily rename contributions dir if it exists
            const tempName = CONTRIBUTIONS_DIR + '.temp';
            let renamed = false;
            
            if (fs.existsSync(CONTRIBUTIONS_DIR)) {
                fs.renameSync(CONTRIBUTIONS_DIR, tempName);
                renamed = true;
            }
            
            try {
                const result = runHandler('--check-only');
                expect(result.success).toBe(true);
                expect(result.output).toContain('Total contributions found: 0');
            } finally {
                // Restore directory
                if (renamed) {
                    fs.renameSync(tempName, CONTRIBUTIONS_DIR);
                }
            }
        });

        test('should validate contribution folders correctly', () => {
            const result = runHandler('--check-only');
            expect(result.success).toBe(true);
            
            // If contributions exist, they should have learnings.md or project-summary.md
            if (!result.output.includes('Total contributions found: 0')) {
                expect(result.output).toMatch(/Files: .*(learnings\.md|project-summary\.md)/);
            }
        });
    });

    describe('Archive Detection Tests', () => {
        
        test('should correctly identify analyzed contributions', () => {
            const result = runHandler('--check-only');
            expect(result.success).toBe(true);
            
            // Should differentiate between new and analyzed
            expect(result.output).toMatch(/Previously analyzed: \d+/);
            expect(result.output).toMatch(/New contributions: \d+/);
        });

        test('should check both implemented and rejected archives', () => {
            // This test verifies the archive checking logic works
            const result = runHandler('--status');
            expect(result.success).toBe(true);
            
            // Archive stats should be present
            expect(result.output).toContain('Archive Status:');
            expect(result.output).toContain('Implemented patterns:');
            expect(result.output).toContain('Rejected patterns:');
        });
    });

    describe('Pattern Extraction Tests', () => {
        
        test('should identify basic patterns in mock content', () => {
            // Create a temporary test contribution
            const testDir = path.join(CONTRIBUTIONS_DIR, 'test-contribution-' + Date.now());
            const testLearnings = `# Test Learnings
            
## Performance Improvements
We improved performance by 50%.

## Testing Enhancements  
Added comprehensive testing coverage.

## Deployment Process
Streamlined deployment with automation.
`;
            
            try {
                // Create test contribution
                fs.mkdirSync(testDir, { recursive: true });
                fs.writeFileSync(path.join(testDir, 'learnings.md'), testLearnings);
                
                // Run analysis
                const result = runHandler('--analyze');
                expect(result.success).toBe(true);
                
                // Should detect patterns
                if (result.output.includes('Analysis report saved to:')) {
                    // Get the report path from output
                    const match = result.output.match(/Analysis report saved to: (.+)/);
                    if (match) {
                        const reportPath = match[1].trim();
                        const report = fs.readFileSync(reportPath, 'utf-8');
                        
                        // Verify patterns were detected
                        expect(report).toContain('Patterns Identified');
                        expect(report).toContain('pattern detected');
                    }
                }
            } finally {
                // Cleanup
                if (fs.existsSync(testDir)) {
                    fs.rmSync(testDir, { recursive: true, force: true });
                }
            }
        });
    });

    describe('Output Format Tests', () => {
        
        test('should use consistent formatting', () => {
            const result = runHandler('--check-only');
            expect(result.success).toBe(true);
            
            // Check for consistent headers
            expect(result.output).toContain('📊 Contribution Status');
            expect(result.output).toContain('━'.repeat(50));
        });

        test('should provide actionable next steps', () => {
            const result = runHandler('--check-only');
            expect(result.success).toBe(true);
            
            // Should always provide guidance
            if (!result.output.includes('All contributions have been analyzed')) {
                expect(result.output).toContain('Run with --analyze');
            }
        });
    });
});

// Integration test to verify the complete workflow
describe('Complete Workflow Integration', () => {
    
    test('should handle complete workflow sequence', () => {
        // 1. Check status
        const status = runHandler('--status');
        expect(status.success).toBe(true);
        
        // 2. Check for new contributions
        const check = runHandler('--check-only');
        expect(check.success).toBe(true);
        
        // 3. Run analysis if needed
        if (!check.output.includes('All contributions have been analyzed')) {
            const analyze = runHandler('--analyze');
            expect(analyze.success).toBe(true);
        }
        
        // 4. Verify final status
        const finalStatus = runHandler('--status');
        expect(finalStatus.success).toBe(true);
        expect(finalStatus.output).toContain('Learning Analysis Status');
    });
});