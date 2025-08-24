const fs = require('fs');
const path = require('path');

// Read the markdown file
const mdPath = path.join(__dirname, '..', 'ai-agent-coordination', 'auto-project-orchestrator.md');
const outputPath = path.join(__dirname, 'ai-agent-coordination-json', 'auto-project-orchestrator.json');

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read markdown content
const content = fs.readFileSync(mdPath, 'utf-8');

// Extract sections and key information
const lines = content.split('\n');
const sections = [];
let currentSection = null;
let currentContent = [];

for (const line of lines) {
  if (line.startsWith('## ')) {
    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim()
      });
    }
    currentSection = line.replace('## ', '').trim();
    currentContent = [];
  } else if (currentSection) {
    currentContent.push(line);
  }
}

// Add last section
if (currentSection) {
  sections.push({
    title: currentSection,
    content: currentContent.join('\n').trim()
  });
}

// Extract key points
const keyPoints = [];
for (const line of lines) {
  const trimmed = line.trim();
  if ((trimmed.startsWith('- ') || trimmed.startsWith('* ')) && 
      trimmed.length > 10 && trimmed.length < 200) {
    keyPoints.push(trimmed.replace(/^[-*]\s*/, ''));
    if (keyPoints.length >= 20) break;
  }
}

// Extract commands
const commands = [];
const commandMatches = content.match(/`\/[a-z-]+`/g);
if (commandMatches) {
  commandMatches.forEach(match => {
    const command = match.replace(/`/g, '');
    if (!commands.includes(command)) {
      commands.push(command);
    }
  });
}

// Create JSON structure
const jsonData = {
  meta: {
    document: "auto-project-orchestrator",
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    source_file: "ai-agent-coordination/auto-project-orchestrator.md",
    document_type: "orchestration_guide",
    category: "ai-agent-coordination"
  },
  summary: "Automated end-to-end project creation system that coordinates all 38 AgileAiAgents to take a project idea from concept to completion using agile methodology without requiring manual agent activation.",
  workflow_optimization: {
    phases: 16,
    time_savings: "40-45%",
    parallel_execution: true,
    quality_gates: 6
  },
  commands: commands,
  sections: sections.map(s => ({
    title: s.title,
    content_preview: s.content.substring(0, 200) + (s.content.length > 200 ? '...' : '')
  })),
  key_features: [
    "16 Sequential Phases with parallel execution opportunities",
    "40-45% time savings through optimized workflow",
    "Context persistence with Project State Manager",
    "Command-based workflow entry points",
    "Automatic quality gates at key decision points",
    "Category-based folder structure (v3.0.0)",
    "Sprint-based agile development",
    "Real-time tracking and monitoring"
  ],
  folder_structure: {
    base: "agile-ai-agents/project-documents/",
    categories: ["orchestration", "business-strategy", "implementation", "operations"]
  },
  agent_coordination: {
    total_agents: 38,
    orchestration: 2,
    business_strategy: 9,
    implementation: 9,
    operations: 8,
    support: 10
  },
  key_points: keyPoints.slice(0, 15)
};

// Write JSON file
fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

console.log('✅ Generated auto-project-orchestrator.json');
console.log(`📁 Location: ${outputPath}`);
console.log(`📊 Size: ${JSON.stringify(jsonData).length} bytes`);