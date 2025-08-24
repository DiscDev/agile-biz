#!/usr/bin/env node

/**
 * Semantic Version Analyzer for AgileAiAgents
 * Analyzes changes since last release to suggest appropriate version bump
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get project root
const projectRoot = path.join(__dirname, '..', '..');

// Read current version
function getCurrentVersion() {
    const versionFile = path.join(projectRoot, 'VERSION.json');
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    return versionData.version;
}

// Parse semantic version
function parseVersion(version) {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major, minor, patch };
}

// Get git commits since last version tag
function getCommitsSinceLastRelease(currentVersion) {
    try {
        // Try to find the last version tag
        const lastTag = execSync(`git describe --tags --abbrev=0 2>/dev/null || echo ""`, { 
            cwd: projectRoot,
            encoding: 'utf8' 
        }).trim();
        
        if (!lastTag) {
            // If no tags, get all commits
            return execSync('git log --oneline', { cwd: projectRoot, encoding: 'utf8' }).trim().split('\n');
        }
        
        // Get commits since last tag
        return execSync(`git log ${lastTag}..HEAD --oneline`, { 
            cwd: projectRoot, 
            encoding: 'utf8' 
        }).trim().split('\n').filter(line => line);
    } catch (error) {
        console.error('Warning: Could not analyze git history:', error.message);
        return [];
    }
}

// Analyze commit messages for conventional commits
function analyzeCommits(commits) {
    const analysis = {
        breaking: false,
        features: 0,
        fixes: 0,
        other: 0,
        breakingMessages: [],
        featureMessages: [],
        fixMessages: []
    };
    
    commits.forEach(commit => {
        const lower = commit.toLowerCase();
        
        // Check for breaking changes
        if (lower.includes('breaking change') || lower.includes('breaking:') || commit.includes('!:')) {
            analysis.breaking = true;
            analysis.breakingMessages.push(commit);
        }
        // Check for features
        else if (lower.startsWith('feat:') || lower.startsWith('feature:') || lower.includes('add')) {
            analysis.features++;
            analysis.featureMessages.push(commit);
        }
        // Check for fixes
        else if (lower.startsWith('fix:') || lower.startsWith('bugfix:') || lower.includes('fix')) {
            analysis.fixes++;
            analysis.fixMessages.push(commit);
        }
        // Other changes
        else {
            analysis.other++;
        }
    });
    
    return analysis;
}

// Analyze CHANGELOG.md for unreleased changes
function analyzeChangelog() {
    const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
    const analysis = {
        breaking: false,
        features: 0,
        fixes: 0,
        removed: 0
    };
    
    try {
        const changelog = fs.readFileSync(changelogPath, 'utf8');
        const unreleasedSection = changelog.match(/## \[Unreleased\]([\s\S]*?)(?=##|$)/);
        
        if (unreleasedSection) {
            const content = unreleasedSection[1];
            
            // Count additions in unreleased section
            const addedMatches = content.match(/### Added([\s\S]*?)(?=###|$)/);
            if (addedMatches) {
                analysis.features = (addedMatches[1].match(/^[-*]/gm) || []).length;
            }
            
            // Count fixes
            const fixedMatches = content.match(/### Fixed([\s\S]*?)(?=###|$)/);
            if (fixedMatches) {
                analysis.fixes = (fixedMatches[1].match(/^[-*]/gm) || []).length;
            }
            
            // Check for breaking changes
            const changedMatches = content.match(/### Changed([\s\S]*?)(?=###|$)/);
            if (changedMatches && changedMatches[1].toLowerCase().includes('breaking')) {
                analysis.breaking = true;
            }
            
            // Count removals (often breaking)
            const removedMatches = content.match(/### Removed([\s\S]*?)(?=###|$)/);
            if (removedMatches) {
                analysis.removed = (removedMatches[1].match(/^[-*]/gm) || []).length;
                if (analysis.removed > 0) {
                    analysis.breaking = true;
                }
            }
        }
    } catch (error) {
        console.error('Warning: Could not analyze CHANGELOG.md:', error.message);
    }
    
    return analysis;
}

// Analyze file changes
function analyzeFileChanges() {
    const analysis = {
        breaking: false,
        majorFiles: [],
        minorFiles: [],
        patchFiles: []
    };
    
    try {
        // Get list of changed files
        const changedFiles = execSync('git diff --name-only HEAD~1 2>/dev/null || git ls-files', {
            cwd: projectRoot,
            encoding: 'utf8'
        }).trim().split('\n').filter(file => file);
        
        changedFiles.forEach(file => {
            // Major version indicators
            if (file.includes('ai-agents/') && file.endsWith('.md')) {
                analysis.majorFiles.push(file);
            }
            // API changes are often breaking
            else if (file.includes('api/') || file.includes('interface')) {
                analysis.breaking = true;
                analysis.majorFiles.push(file);
            }
            // New features
            else if (file.includes('machine-data/') || file.includes('hooks/') || file.includes('templates/')) {
                analysis.minorFiles.push(file);
            }
            // Bug fixes and documentation
            else if (file.includes('test') || file.includes('doc') || file.endsWith('.json')) {
                analysis.patchFiles.push(file);
            }
        });
    } catch (error) {
        console.error('Warning: Could not analyze file changes:', error.message);
    }
    
    return analysis;
}

// Determine recommended version bump
function determineVersionBump(currentVersion, commitAnalysis, changelogAnalysis, fileAnalysis) {
    const current = parseVersion(currentVersion);
    let recommendation = {
        type: 'patch',
        version: `${current.major}.${current.minor}.${current.patch + 1}`,
        reason: []
    };
    
    // Check for breaking changes (major version)
    if (commitAnalysis.breaking || changelogAnalysis.breaking || fileAnalysis.breaking) {
        recommendation.type = 'major';
        recommendation.version = `${current.major + 1}.0.0`;
        recommendation.reason.push('Breaking changes detected');
        
        if (commitAnalysis.breakingMessages.length > 0) {
            recommendation.reason.push(`- ${commitAnalysis.breakingMessages.length} breaking change commits`);
        }
        if (changelogAnalysis.removed > 0) {
            recommendation.reason.push(`- ${changelogAnalysis.removed} removed features`);
        }
        if (fileAnalysis.majorFiles.length > 0) {
            recommendation.reason.push(`- Major file changes in: ${fileAnalysis.majorFiles.slice(0, 3).join(', ')}${fileAnalysis.majorFiles.length > 3 ? '...' : ''}`);
        }
    }
    // Check for new features (minor version)
    else if (commitAnalysis.features > 0 || changelogAnalysis.features > 0 || fileAnalysis.minorFiles.length > 5) {
        recommendation.type = 'minor';
        recommendation.version = `${current.major}.${current.minor + 1}.0`;
        recommendation.reason.push('New features detected');
        
        if (commitAnalysis.features > 0) {
            recommendation.reason.push(`- ${commitAnalysis.features} feature commits`);
        }
        if (changelogAnalysis.features > 0) {
            recommendation.reason.push(`- ${changelogAnalysis.features} features in CHANGELOG`);
        }
        if (fileAnalysis.minorFiles.length > 0) {
            recommendation.reason.push(`- Feature files: ${fileAnalysis.minorFiles.slice(0, 3).join(', ')}${fileAnalysis.minorFiles.length > 3 ? '...' : ''}`);
        }
    }
    // Default to patch for fixes and small changes
    else {
        recommendation.reason.push('Bug fixes and minor updates');
        
        if (commitAnalysis.fixes > 0) {
            recommendation.reason.push(`- ${commitAnalysis.fixes} fix commits`);
        }
        if (changelogAnalysis.fixes > 0) {
            recommendation.reason.push(`- ${changelogAnalysis.fixes} fixes in CHANGELOG`);
        }
        if (fileAnalysis.patchFiles.length > 0) {
            recommendation.reason.push(`- Updated: ${fileAnalysis.patchFiles.slice(0, 3).join(', ')}${fileAnalysis.patchFiles.length > 3 ? '...' : ''}`);
        }
    }
    
    return recommendation;
}

// Main function
function main() {
    try {
        const currentVersion = getCurrentVersion();
        console.log(`Current version: ${currentVersion}\n`);
        
        // Analyze commits
        console.log('Analyzing commits...');
        const commits = getCommitsSinceLastRelease(currentVersion);
        const commitAnalysis = analyzeCommits(commits);
        
        // Analyze CHANGELOG
        console.log('Analyzing CHANGELOG.md...');
        const changelogAnalysis = analyzeChangelog();
        
        // Analyze file changes
        console.log('Analyzing file changes...');
        const fileAnalysis = analyzeFileChanges();
        
        // Determine recommendation
        const recommendation = determineVersionBump(currentVersion, commitAnalysis, changelogAnalysis, fileAnalysis);
        
        // Output results
        console.log('\n' + '='.repeat(50));
        console.log('SEMANTIC VERSION ANALYSIS');
        console.log('='.repeat(50));
        
        console.log(`\nRecommended version bump: ${recommendation.type.toUpperCase()}`);
        console.log(`Suggested version: ${recommendation.version}`);
        console.log('\nReasoning:');
        recommendation.reason.forEach(reason => {
            console.log(`  ${reason}`);
        });
        
        console.log('\nAnalysis Summary:');
        console.log(`  Commits analyzed: ${commits.length}`);
        console.log(`  Breaking changes: ${commitAnalysis.breaking || changelogAnalysis.breaking ? 'YES' : 'No'}`);
        console.log(`  New features: ${commitAnalysis.features + changelogAnalysis.features}`);
        console.log(`  Bug fixes: ${commitAnalysis.fixes + changelogAnalysis.fixes}`);
        
        // Return just the version for script integration
        if (process.argv.includes('--version-only')) {
            console.log(`\n${recommendation.version}`);
        }
        
        // Exit with code indicating bump type (for script integration)
        // 0 = patch, 1 = minor, 2 = major
        const exitCode = recommendation.type === 'major' ? 2 : recommendation.type === 'minor' ? 1 : 0;
        process.exit(exitCode);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(3);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { getCurrentVersion, determineVersionBump, analyzeCommits, analyzeChangelog };