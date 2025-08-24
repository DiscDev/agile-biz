/**
 * Simple agent JSON generator without external dependencies
 */

const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Write JSON file
function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Generate PRD Agent JSON
function generatePRDAgentJSON() {
  return {
    meta: {
      agent: "prd_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/prd_agent.md"
    },
    summary: "Creates comprehensive Product Requirements Documents based on research and stakeholder input",
    capabilities: [
      "requirements_gathering",
      "user_story_creation",
      "acceptance_criteria_definition",
      "feature_prioritization",
      "success_metrics_definition"
    ],
    tools: [],  // PRD Agent typically doesn't need MCPs
    context_priorities: {
      "research_agent": {
        critical: ["market_gap", "target_audience", "top_competitors", "viability_score"],
        optional: ["competitor_features", "pricing_analysis", "technology_trends", "regulatory_requirements"]
      },
      "finance_agent": {
        critical: ["budget_constraints", "roi_requirements", "cost_projections"],
        optional: ["financial_projections", "pricing_models", "investment_timeline"]
      },
      "marketing_agent": {
        critical: ["brand_positioning", "target_personas", "value_proposition"],
        optional: ["go_to_market_strategy", "messaging_framework", "channel_strategy"]
      },
      "analysis_agent": {
        critical: ["strategic_recommendations", "risk_assessment", "success_factors"],
        optional: ["swot_analysis", "market_opportunities", "competitive_advantages"]
      }
    },
    workflows: {
      "new_feature": {
        description: "Workflow for new feature requirements",
        steps: ["market_validation", "user_research", "technical_feasibility", "requirements_documentation"]
      }
    },
    output_schema: "schemas/prd-output.schema.json",
    streaming_events: [],
    dependencies: {
      required_before: ["research_agent", "finance_agent", "marketing_agent"],
      provides_to: ["ui_ux_agent", "coder_agent", "project_manager_agent"]
    }
  };
}

// Generate Coder Agent JSON
function generateCoderAgentJSON() {
  return {
    meta: {
      agent: "coder_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/coder_agent.md"
    },
    summary: "Implements software solutions following best practices and project requirements",
    capabilities: [
      "full_stack_development",
      "api_implementation",
      "database_design",
      "code_optimization",
      "security_implementation"
    ],
    tools: [
      "context7_mcp",  // Up-to-date documentation
      "github_mcp",    // Version control and collaboration
      "supabase_mcp",  // Database and backend services
      "aws_mcp"        // Cloud services
    ],
    context_priorities: {
      "prd_agent": {
        critical: ["tech_requirements", "api_specs", "database_schema", "core_features"],
        optional: ["nice_to_have_features", "performance_benchmarks", "scalability_requirements", "integration_requirements"]
      },
      "ui_ux_agent": {
        critical: ["component_structure", "state_management", "api_endpoints"],
        optional: ["design_tokens", "animation_specs", "responsive_breakpoints"]
      },
      "testing_agent": {
        critical: ["failed_tests", "coverage_gaps", "critical_bugs"],
        optional: ["performance_issues", "code_smells", "test_recommendations"]
      },
      "security_agent": {
        critical: ["critical_vulnerabilities", "auth_requirements", "data_encryption"],
        optional: ["security_best_practices", "compliance_requirements", "security_testing_results"]
      }
    },
    workflows: {
      "feature_implementation": {
        description: "Standard feature development workflow",
        steps: ["requirements_analysis", "design_review", "implementation", "testing", "documentation"]
      }
    },
    output_schema: "schemas/coder-output.schema.json",
    streaming_events: ["module_started", "module_completed", "error_found"],
    dependencies: {
      required_before: ["prd_agent", "ui_ux_agent"],
      provides_to: ["testing_agent", "devops_agent", "documentation_agent"]
    }
  };
}

// Generate Testing Agent JSON
function generateTestingAgentJSON() {
  return {
    meta: {
      agent: "testing_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/testing_agent.md"
    },
    summary: "Ensures software quality through comprehensive testing and validation",
    capabilities: [
      "test_strategy_planning",
      "automated_testing",
      "real_browser_testing",
      "performance_testing",
      "security_testing"
    ],
    tools: [
      "playwright_mcp",    // Browser automation testing
      "browserstack_mcp",  // Cross-browser and device testing
      "context7_mcp"       // Up-to-date testing documentation
    ],
    context_priorities: {
      "coder_agent": {
        critical: ["modules_completed", "api_endpoints", "test_files", "tech_stack_used"],
        optional: ["code_complexity", "dependency_graph", "performance_targets", "known_issues"]
      },
      "prd_agent": {
        critical: ["test_criteria", "quality_standards", "core_features"],
        optional: ["edge_cases", "user_workflows", "performance_requirements"]
      },
      "security_agent": {
        critical: ["security_test_requirements", "vulnerability_checks", "compliance_tests"],
        optional: ["penetration_test_results", "security_best_practices", "threat_models"]
      }
    },
    workflows: {
      "test_execution": {
        description: "Comprehensive test execution workflow",
        steps: ["test_planning", "test_setup", "execution", "result_analysis", "reporting"]
      }
    },
    output_schema: "schemas/testing-output.schema.json",
    streaming_events: ["test_started", "test_failed", "test_passed", "suite_completed"],
    dependencies: {
      required_before: ["coder_agent"],
      provides_to: ["devops_agent", "project_manager_agent"]
    }
  };
}

// Generate Research Agent JSON
function generateResearchAgentJSON() {
  return {
    meta: {
      agent: "research_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/research_agent.md"
    },
    summary: "Specializes in comprehensive information discovery, competitive analysis, and knowledge synthesis",
    capabilities: [
      "market_research",
      "competitive_analysis",
      "technology_landscape_analysis",
      "brand_domain_research",
      "financial_research"
    ],
    tools: [
      "perplexity_mcp",  // Real-time web search and research
      "firecrawl_mcp"    // Web scraping and content extraction
    ],
    context_priorities: {
      "analysis_agent": {
        critical: ["strategic_direction", "key_priorities", "risk_factors"],
        optional: ["swot_analysis", "decision_criteria", "scenario_analysis"]
      },
      "marketing_agent": {
        critical: ["target_segments", "competitor_list", "positioning_gaps"],
        optional: ["campaign_insights", "channel_effectiveness", "brand_perception"]
      },
      "finance_agent": {
        critical: ["budget_allocation", "roi_targets", "cost_sensitivity"],
        optional: ["financial_projections", "investment_timeline", "revenue_models"]
      }
    },
    workflows: {
      "competitive_analysis": {
        description: "Competitive Analysis Workflow",
        steps: ["scope_definition", "data_collection", "analysis_synthesis", "documentation_reporting"]
      },
      "brand_domain_research": {
        description: "Comprehensive Branding & Domain Research Workflow",
        steps: ["competitive_brand_analysis", "brand_name_generation", "trademark_research", "domain_availability"]
      }
    },
    output_schema: "schemas/research-output.schema.json",
    streaming_events: ["research_started", "competitor_found", "market_gap_identified", "research_completed"],
    dependencies: {
      required_before: [],
      provides_to: ["prd_agent", "marketing_agent", "finance_agent", "analysis_agent"]
    }
  };
}

// Generate Marketing Agent JSON
function generateMarketingAgentJSON() {
  return {
    meta: {
      agent: "marketing_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/marketing_agent.md"
    },
    summary: "Specializes in marketing strategy development, content creation, and campaign execution",
    capabilities: [
      "marketing_strategy",
      "content_creation",
      "campaign_execution",
      "lead_generation",
      "brand_development"
    ],
    tools: [
      "perplexity_mcp",  // Market intelligence and trends
      "firecrawl_mcp"    // Competitor campaign analysis
    ],
    context_priorities: {
      "research_agent": {
        critical: ["market_gap", "target_audience", "top_competitors", "brand_research"],
        optional: ["competitive_analysis", "market_trends", "pricing_benchmarks", "technology_landscape"]
      },
      "prd_agent": {
        critical: ["value_proposition", "key_features", "target_personas"],
        optional: ["feature_roadmap", "use_cases", "differentiators"]
      },
      "finance_agent": {
        critical: ["marketing_budget", "cac_targets", "roi_requirements"],
        optional: ["ltv_projections", "channel_budgets", "payback_period"]
      },
      "analysis_agent": {
        critical: ["strategic_positioning", "growth_targets", "success_metrics"],
        optional: ["swot_analysis", "market_segments", "competitive_advantages"]
      }
    },
    workflows: {
      "product_launch": {
        description: "Product Launch Campaign",
        steps: ["launch_strategy", "content_creation", "campaign_execution", "performance_monitoring"]
      },
      "lead_generation": {
        description: "Lead Generation Campaign",
        steps: ["campaign_planning", "content_development", "campaign_launch", "optimization_analysis"]
      }
    },
    output_schema: "schemas/marketing-output.schema.json",
    streaming_events: ["campaign_launched", "milestone_reached", "optimization_applied"],
    dependencies: {
      required_before: ["research_agent", "prd_agent", "finance_agent"],
      provides_to: ["seo_agent", "ppc_agent", "social_media_agent", "email_agent"]
    }
  };
}

// Generate Finance Agent JSON
function generateFinanceAgentJSON() {
  return {
    meta: {
      agent: "finance_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/finance_agent.md"
    },
    summary: "Specializes in financial planning, budgeting, cost analysis, and financial reporting",
    capabilities: [
      "ai_cost_analysis",
      "budget_planning",
      "revenue_modeling",
      "investment_strategy",
      "financial_reporting"
    ],
    tools: [],  // Finance Agent typically uses financial analysis tools rather than MCPs
    context_priorities: {
      "research_agent": {
        critical: ["market_size", "ai_development_costs", "pricing_benchmarks"],
        optional: ["competitor_funding", "market_growth_rate", "investment_landscape"]
      },
      "analysis_agent": {
        critical: ["revenue_projections", "cost_structure", "investment_requirements"],
        optional: ["scenario_analysis", "risk_factors", "growth_assumptions"]
      },
      "project_manager_agent": {
        critical: ["project_timeline", "resource_requirements", "sprint_velocity"],
        optional: ["task_estimates", "dependency_risks", "resource_utilization"]
      }
    },
    workflows: {
      "ai_development_financial_plan": {
        description: "AI-Powered Development Financial Plan",
        steps: ["ai_cost_analysis", "token_projections", "cost_comparison", "revenue_design", "roi_analysis"]
      },
      "investment_package": {
        description: "Venture Capital Investment Package",
        steps: ["requirements_analysis", "model_development", "presentation_creation", "documentation"]
      }
    },
    output_schema: "schemas/finance-output.schema.json",
    streaming_events: ["budget_allocated", "cost_overrun", "milestone_reached"],
    dependencies: {
      required_before: ["research_agent", "analysis_agent"],
      provides_to: ["marketing_agent", "project_manager_agent", "all_operational_agents"]
    }
  };
}

// Generate Analysis Agent JSON
function generateAnalysisAgentJSON() {
  return {
    meta: {
      agent: "analysis_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/analysis_agent.md"
    },
    summary: "Specializes in data processing, statistical analysis, and business intelligence",
    capabilities: [
      "data_analysis",
      "statistical_modeling",
      "business_intelligence",
      "performance_metrics",
      "predictive_analytics"
    ],
    tools: [
      "perplexity_mcp",  // Real-time data analysis
      "firecrawl_mcp"    // Market data extraction
    ],
    context_priorities: {
      "research_agent": {
        critical: ["market_intelligence", "competitive_analysis", "risk_assessment"],
        optional: ["technology_landscape", "brand_research", "financial_research"]
      },
      "marketing_agent": {
        critical: ["performance_targets", "channel_metrics", "campaign_results"],
        optional: ["content_strategy", "lead_analytics", "attribution_data"]
      },
      "finance_agent": {
        critical: ["financial_metrics", "budget_performance", "revenue_data"],
        optional: ["cost_breakdown", "projections", "investment_metrics"]
      },
      "logger_agent": {
        critical: ["system_metrics", "error_patterns", "usage_analytics"],
        optional: ["detailed_logs", "trace_data", "historical_trends"]
      }
    },
    workflows: {
      "data_analysis": {
        description: "Comprehensive data analysis workflow",
        steps: ["data_collection", "processing", "analysis", "insight_generation", "reporting"]
      }
    },
    output_schema: "schemas/analysis-output.schema.json",
    streaming_events: ["analysis_started", "insight_found", "anomaly_detected", "analysis_completed"],
    dependencies: {
      required_before: [],
      provides_to: ["prd_agent", "marketing_agent", "finance_agent", "project_manager_agent"]
    }
  };
}

// Generate UI/UX Agent JSON
function generateUIUXAgentJSON() {
  return {
    meta: {
      agent: "ui_ux_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/ui_ux_agent.md"
    },
    summary: "Specializes in user interface design, user experience optimization, and design system management",
    capabilities: [
      "user_experience_design",
      "visual_interface_design",
      "design_system_management",
      "prototype_development",
      "accessibility_compliance"
    ],
    tools: [
      "figma_mcp"  // Direct Figma integration for design creation
    ],
    context_priorities: {
      "prd_agent": {
        critical: ["user_personas", "core_features", "user_flows"],
        optional: ["acceptance_criteria", "user_stories", "edge_cases"]
      },
      "research_agent": {
        critical: ["target_audience", "competitor_interfaces", "usability_gaps"],
        optional: ["design_trends", "user_preferences", "accessibility_requirements"]
      },
      "marketing_agent": {
        critical: ["brand_guidelines", "value_proposition", "conversion_goals"],
        optional: ["campaign_themes", "content_strategy", "engagement_metrics"]
      }
    },
    workflows: {
      "competitive_design": {
        description: "Competitive Design Analysis Workflow",
        steps: ["competitive_research", "competitor_analysis", "ux_strategy", "design_creation", "documentation"]
      },
      "figma_design": {
        description: "Figma MCP Design Creation Workflow",
        steps: ["file_setup", "design_system", "screen_design", "prototyping", "handoff"]
      }
    },
    output_schema: "schemas/ui-ux-output.schema.json",
    streaming_events: ["design_started", "component_created", "review_completed", "handoff_ready"],
    dependencies: {
      required_before: ["prd_agent", "research_agent"],
      provides_to: ["coder_agent", "testing_agent", "marketing_agent"]
    }
  };
}

// Generate Project Manager Agent JSON
function generateProjectManagerAgentJSON() {
  return {
    meta: {
      agent: "project_manager_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/project_manager_agent.md"
    },
    summary: "Specializes in Agile project management, sprint planning, timeline coordination, and stakeholder communication",
    capabilities: [
      "sprint_planning",
      "task_management",
      "agent_coordination",
      "risk_management",
      "stakeholder_communication"
    ],
    tools: [],  // Project Manager typically uses project management platforms rather than MCPs
    context_priorities: {
      "prd_agent": {
        critical: ["project_scope", "milestones", "requirements_summary"],
        optional: ["detailed_requirements", "acceptance_criteria", "user_stories"]
      },
      "all_reporting_agents": {
        critical: ["task_status", "blockers", "completion_percentage"],
        optional: ["detailed_progress", "time_logs", "quality_metrics"]
      },
      "testing_agent": {
        critical: ["test_failures", "critical_bugs", "retry_count"],
        optional: ["test_logs", "performance_data", "coverage_reports"]
      },
      "finance_agent": {
        critical: ["budget_status", "resource_constraints", "burn_rate"],
        optional: ["detailed_costs", "projections", "variance_analysis"]
      }
    },
    workflows: {
      "sprint_planning": {
        description: "Sprint Planning Workflow",
        steps: ["preparation", "goal_definition", "backlog_creation", "agent_assignment", "communication"]
      },
      "test_failure_management": {
        description: "3-Attempt Loop Protection Workflow",
        steps: ["attempt_tracking", "decision_logic", "user_escalation", "resolution_tracking"]
      }
    },
    output_schema: "schemas/project-manager-output.schema.json",
    streaming_events: ["sprint_started", "task_assigned", "blocker_identified", "milestone_reached", "sprint_completed"],
    dependencies: {
      required_before: ["prd_agent"],
      provides_to: ["all_agents"],
      coordinates: ["all_agents"]
    }
  };
}

// Generate DevOps Agent JSON
function generateDevOpsAgentJSON() {
  return {
    meta: {
      agent: "devops_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/devops_agent.md"
    },
    summary: "Specializes in infrastructure management, deployment automation, and operational excellence",
    capabilities: [
      "infrastructure_as_code",
      "ci_cd_management",
      "container_orchestration",
      "monitoring_observability",
      "security_automation"
    ],
    tools: [
      "context7_mcp",   // Up-to-date infrastructure documentation
      "aws_mcp",        // AWS infrastructure management
      "github_mcp",     // CI/CD and deployment
      "cloudflare_mcp", // CDN and DNS management
      "linode_mcp"      // Cloud infrastructure
    ],
    context_priorities: {
      "coder_agent": {
        critical: ["deployment_config", "tech_stack", "port_requirements"],
        optional: ["build_scripts", "dependencies", "environment_variables"]
      },
      "testing_agent": {
        critical: ["deployment_readiness", "performance_benchmarks", "critical_issues"],
        optional: ["test_environments", "load_test_results", "security_scan_results"]
      },
      "project_manager_agent": {
        critical: ["deployment_schedule", "rollback_requirements", "stakeholder_approvals"],
        optional: ["resource_allocation", "timeline_constraints", "risk_mitigation"]
      },
      "security_agent": {
        critical: ["security_requirements", "compliance_needs", "access_controls"],
        optional: ["vulnerability_reports", "audit_requirements", "encryption_specs"]
      }
    },
    workflows: {
      "dynamic_port_management": {
        description: "Dynamic Port Management & Deployment Workflow",
        steps: ["port_planning", "container_config", "load_balancer_setup", "validation", "production_management"]
      },
      "production_deployment": {
        description: "Production Deployment Workflow",
        steps: ["pre_deployment", "deployment", "post_deployment", "monitoring"]
      }
    },
    output_schema: "schemas/devops-output.schema.json",
    streaming_events: ["deployment_started", "health_check", "scaling_event", "deployment_completed"],
    dependencies: {
      required_before: ["coder_agent", "testing_agent"],
      provides_to: ["logger_agent", "monitoring_systems"],
      collaborates_with: ["security_agent", "project_manager_agent"]
    }
  };
}

// Generate SEO Agent JSON
function generateSEOAgentJSON() {
  return {
    meta: {
      agent: "seo_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/seo_agent.md"
    },
    summary: "Specializes in comprehensive search optimization for traditional search engines and LLM-powered search systems",
    capabilities: [
      "technical_seo",
      "keyword_research",
      "llm_optimization",
      "content_strategy",
      "performance_monitoring"
    ],
    tools: [
      "perplexity_mcp",  // SEO intelligence and trends
      "firecrawl_mcp"    // SERP analysis and competitor research
    ],
    context_priorities: {
      "ui_ux_agent": {
        critical: ["site_structure", "page_urls", "user_flows"],
        optional: ["design_assets", "interaction_patterns", "mobile_breakpoints"]
      },
      "marketing_agent": {
        critical: ["target_keywords", "content_strategy", "brand_messaging"],
        optional: ["content_calendar", "competitor_keywords", "campaign_focus"]
      },
      "research_agent": {
        critical: ["market_terminology", "competitor_seo", "search_trends"],
        optional: ["user_questions", "content_gaps", "seasonal_trends"]
      },
      "coder_agent": {
        critical: ["tech_stack", "rendering_method", "api_structure"],
        optional: ["performance_metrics", "third_party_scripts", "database_schema"]
      }
    },
    workflows: {
      "seo_strategy": {
        description: "Comprehensive SEO Strategy Development",
        steps: ["foundation_analysis", "technical_architecture", "traditional_seo", "llm_optimization", "implementation"]
      },
      "llm_indexing": {
        description: "LLM Indexing & AI Citation Strategy",
        steps: ["query_research", "training_data_positioning", "citation_optimization", "authority_building", "monitoring"]
      }
    },
    output_schema: "schemas/seo-output.schema.json",
    streaming_events: ["seo_audit_started", "critical_issue", "optimization_complete", "ranking_update"],
    dependencies: {
      required_before: ["ui_ux_agent", "marketing_agent"],
      provides_to: ["coder_agent", "documentation_agent"],
      collaborates_with: ["research_agent", "marketing_agent"]
    }
  };
}

// Generate ML Agent JSON
function generateMLAgentJSON() {
  return {
    meta: {
      agent: "ml_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/ml_agent.md"
    },
    summary: "Specializes in machine learning model development, training, and deployment",
    capabilities: [
      "model_architecture_design",
      "data_preprocessing",
      "model_training",
      "hyperparameter_tuning",
      "model_deployment",
      "performance_optimization"
    ],
    tools: [
      "context7_mcp"  // Up-to-date ML documentation and best practices
    ],
    context_priorities: {
      "data_engineer_agent": {
        critical: ["processed_datasets", "data_pipelines", "feature_engineering"],
        optional: ["data_quality_metrics", "data_lineage", "transformation_logs"]
      },
      "coder_agent": {
        critical: ["api_requirements", "integration_points", "deployment_infrastructure"],
        optional: ["service_architecture", "performance_requirements", "scaling_needs"]
      }
    },
    workflows: {
      "model_development": {
        description: "End-to-end ML model development workflow",
        steps: ["data_analysis", "model_selection", "training", "evaluation", "deployment"]
      }
    },
    output_schema: "schemas/ml-output.schema.json",
    streaming_events: ["training_started", "epoch_completed", "model_deployed"],
    dependencies: {
      required_before: ["data_engineer_agent"],
      provides_to: ["coder_agent", "testing_agent", "devops_agent"]
    }
  };
}

// Generate DBA Agent JSON
function generateDBAAgentJSON() {
  return {
    meta: {
      agent: "dba_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/dba_agent.md"
    },
    summary: "Specializes in database architecture, optimization, and administration",
    capabilities: [
      "database_design",
      "query_optimization",
      "backup_recovery",
      "performance_tuning",
      "security_hardening",
      "migration_planning"
    ],
    tools: [
      "context7_mcp"  // Up-to-date database documentation
    ],
    context_priorities: {
      "coder_agent": {
        critical: ["data_models", "query_patterns", "transaction_requirements"],
        optional: ["orm_usage", "connection_pooling", "caching_strategy"]
      },
      "devops_agent": {
        critical: ["backup_requirements", "scaling_needs", "availability_requirements"],
        optional: ["monitoring_metrics", "disaster_recovery", "maintenance_windows"]
      }
    },
    workflows: {
      "database_optimization": {
        description: "Database performance optimization workflow",
        steps: ["performance_analysis", "index_optimization", "query_tuning", "monitoring_setup"]
      }
    },
    output_schema: "schemas/dba-output.schema.json",
    streaming_events: ["migration_started", "backup_completed", "optimization_applied"],
    dependencies: {
      required_before: ["prd_agent"],
      provides_to: ["coder_agent", "devops_agent", "data_engineer_agent"]
    }
  };
}

// Generate Data Engineer Agent JSON
function generateDataEngineerAgentJSON() {
  return {
    meta: {
      agent: "data_engineer_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/data_engineer_agent.md"
    },
    summary: "Specializes in data pipeline development, ETL processes, and data infrastructure",
    capabilities: [
      "data_pipeline_design",
      "etl_development",
      "data_warehousing",
      "stream_processing",
      "data_quality_assurance",
      "data_governance"
    ],
    tools: [
      "context7_mcp"  // Up-to-date data engineering documentation
    ],
    context_priorities: {
      "dba_agent": {
        critical: ["database_schemas", "data_sources", "access_patterns"],
        optional: ["performance_metrics", "storage_optimization", "backup_strategies"]
      },
      "ml_agent": {
        critical: ["feature_requirements", "data_formats", "preprocessing_needs"],
        optional: ["model_inputs", "training_datasets", "validation_splits"]
      }
    },
    workflows: {
      "etl_pipeline": {
        description: "ETL pipeline development workflow",
        steps: ["source_analysis", "transformation_design", "pipeline_implementation", "quality_checks"]
      }
    },
    output_schema: "schemas/data-engineer-output.schema.json",
    streaming_events: ["pipeline_started", "transformation_completed", "quality_check_passed"],
    dependencies: {
      required_before: ["dba_agent"],
      provides_to: ["ml_agent", "analysis_agent", "bi_agent"]
    }
  };
}

// Generate Security Agent JSON
function generateSecurityAgentJSON() {
  return {
    meta: {
      agent: "security_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/security_agent.md"
    },
    summary: "Specializes in application security, vulnerability assessment, and compliance",
    capabilities: [
      "threat_modeling",
      "security_auditing",
      "vulnerability_assessment",
      "compliance_verification",
      "security_architecture",
      "incident_response"
    ],
    tools: [
      "context7_mcp"  // Up-to-date security documentation and CVE databases
    ],
    context_priorities: {
      "coder_agent": {
        critical: ["code_vulnerabilities", "auth_implementation", "data_handling"],
        optional: ["third_party_dependencies", "api_security", "input_validation"]
      },
      "devops_agent": {
        critical: ["infrastructure_security", "access_controls", "compliance_requirements"],
        optional: ["security_monitoring", "incident_response", "audit_logs"]
      }
    },
    workflows: {
      "security_audit": {
        description: "Comprehensive security audit workflow",
        steps: ["threat_assessment", "vulnerability_scanning", "penetration_testing", "remediation_planning"]
      }
    },
    output_schema: "schemas/security-output.schema.json",
    streaming_events: ["scan_started", "vulnerability_found", "audit_completed"],
    dependencies: {
      required_before: [],
      provides_to: ["coder_agent", "devops_agent", "testing_agent", "compliance_agent"]
    }
  };
}

// Generate API Agent JSON
function generateAPIAgentJSON() {
  return {
    meta: {
      agent: "api_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/api_agent.md"
    },
    summary: "Specializes in researching and recommending external APIs for development and application features",
    capabilities: [
      "api_discovery",
      "cost_analysis",
      "trust_evaluation",
      "integration_assessment",
      "feature_mapping",
      "vendor_comparison"
    ],
    tools: [],  // API Agent primarily uses web research rather than MCPs
    context_priorities: {
      "prd_agent": {
        critical: ["feature_requirements", "technical_constraints", "integration_requirements"],
        optional: ["nice_to_have_features", "scalability_requirements", "performance_benchmarks"]
      },
      "finance_agent": {
        critical: ["api_budget", "cost_constraints", "roi_requirements"],
        optional: ["growth_projections", "budget_flexibility", "payment_preferences"]
      },
      "coder_agent": {
        critical: ["tech_stack", "integration_capabilities", "security_requirements"],
        optional: ["preferred_sdks", "existing_integrations", "technical_debt"]
      },
      "research_agent": {
        critical: ["competitor_apis", "market_standards", "user_expectations"],
        optional: ["emerging_apis", "regional_preferences", "industry_trends"]
      }
    },
    workflows: {
      "api_research": {
        description: "Comprehensive API research and evaluation workflow",
        steps: ["requirement_analysis", "api_discovery", "cost_evaluation", "trust_assessment", "recommendation"]
      }
    },
    output_schema: "schemas/api-output.schema.json",
    streaming_events: ["research_started", "api_found", "cost_alert", "research_completed"],
    dependencies: {
      required_before: ["prd_agent", "finance_agent"],
      provides_to: ["coder_agent", "devops_agent", "finance_agent"]
    }
  };
}

// Generate LLM Agent JSON
function generateLLMAgentJSON() {
  return {
    meta: {
      agent: "llm_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/llm_agent.md"
    },
    summary: "Specializes in researching and recommending optimal Large Language Models for AI-powered features",
    capabilities: [
      "llm_research",
      "performance_evaluation",
      "cost_modeling",
      "feature_matching",
      "vendor_comparison",
      "token_optimization"
    ],
    tools: [],  // LLM Agent primarily uses research and evaluation rather than MCPs
    context_priorities: {
      "prd_agent": {
        critical: ["feature_requirements", "ai_integration_needs", "user_interaction_modes"],
        optional: ["performance_requirements", "scalability_needs", "quality_standards"]
      },
      "finance_agent": {
        critical: ["llm_budget", "token_limits", "roi_requirements"],
        optional: ["growth_projections", "cost_flexibility", "billing_preferences"]
      },
      "coder_agent": {
        critical: ["tech_stack", "integration_points", "api_requirements"],
        optional: ["existing_ai_usage", "performance_constraints", "deployment_environment"]
      },
      "research_agent": {
        critical: ["competitor_llms", "user_expectations", "market_trends"],
        optional: ["emerging_models", "user_feedback", "industry_benchmarks"]
      }
    },
    workflows: {
      "llm_evaluation": {
        description: "Comprehensive LLM research and selection workflow",
        steps: ["requirement_analysis", "model_research", "performance_testing", "cost_analysis", "recommendation"]
      }
    },
    output_schema: "schemas/llm-output.schema.json",
    streaming_events: ["research_started", "model_evaluated", "feature_match", "research_completed"],
    dependencies: {
      required_before: ["prd_agent", "finance_agent"],
      provides_to: ["coder_agent", "api_agent", "finance_agent"]
    }
  };
}

// Generate MCP Agent JSON
function generateMCPAgentJSON() {
  return {
    meta: {
      agent: "mcp_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/mcp_agent.md"
    },
    summary: "Specializes in discovering and integrating MCP servers that enhance AI agent capabilities and reduce costs",
    capabilities: [
      "mcp_discovery",
      "cost_optimization",
      "agent_mapping",
      "integration_guidance",
      "configuration_templates",
      "zen_mcp_setup"
    ],
    tools: [],  // MCP Agent primarily uses research and configuration rather than MCPs itself
    context_priorities: {
      "prd_agent": {
        critical: ["feature_requirements", "technical_constraints", "integration_needs"],
        optional: ["development_tools", "scalability_requirements", "performance_benchmarks"]
      },
      "coder_agent": {
        critical: ["tech_stack", "development_environment", "deployment_targets"],
        optional: ["existing_tools", "team_preferences", "integration_complexity"]
      },
      "llm_agent": {
        critical: ["llm_choices", "cost_optimization_needs", "multi_model_requirements"],
        optional: ["token_usage_patterns", "model_routing_needs", "performance_requirements"]
      },
      "project_manager_agent": {
        critical: ["agent_assignments", "development_timeline", "priority_features"],
        optional: ["team_structure", "workflow_preferences", "collaboration_tools"]
      }
    },
    workflows: {
      "mcp_research": {
        description: "MCP server discovery and integration planning workflow",
        steps: ["requirement_analysis", "mcp_discovery", "agent_mapping", "cost_analysis", "setup_documentation"]
      },
      "zen_mcp_optimization": {
        description: "Multi-model cost optimization setup workflow",
        steps: ["api_key_collection", "model_routing_config", "cost_monitoring_setup", "agent_integration"]
      }
    },
    output_schema: "schemas/mcp-output.schema.json",
    streaming_events: ["research_started", "mcp_found", "agent_mapping", "research_completed"],
    dependencies: {
      required_before: ["prd_agent", "llm_agent"],
      provides_to: ["coder_agent", "devops_agent", "llm_agent", "all_agents"]
    }
  };
}

// Generate Documentation Agent JSON
function generateDocumentationAgentJSON() {
  return {
    meta: {
      agent: "documentation_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/documentator_agent.md"
    },
    summary: "Specializes in creating and maintaining comprehensive documentation for all project aspects",
    capabilities: [
      "technical_documentation",
      "api_documentation",
      "user_guides",
      "process_documentation",
      "content_organization",
      "version_control"
    ],
    tools: [],  // Documentation Agent primarily uses writing and organization tools
    context_priorities: {
      "coder_agent": {
        critical: ["api_endpoints", "code_structure", "integration_points"],
        optional: ["code_comments", "function_signatures", "error_codes"]
      },
      "prd_agent": {
        critical: ["feature_descriptions", "user_stories", "acceptance_criteria"],
        optional: ["technical_specs", "edge_cases", "future_roadmap"]
      },
      "testing_agent": {
        critical: ["test_scenarios", "setup_requirements", "known_issues"],
        optional: ["test_results", "coverage_reports", "bug_reports"]
      },
      "ui_ux_agent": {
        critical: ["user_flows", "interaction_patterns", "accessibility_requirements"],
        optional: ["design_rationale", "style_guide", "component_library"]
      }
    },
    workflows: {
      "feature_documentation": {
        description: "Comprehensive feature documentation workflow",
        steps: ["information_gathering", "content_planning", "content_creation", "review_validation", "publication"]
      },
      "api_documentation": {
        description: "API reference documentation workflow",
        steps: ["endpoint_analysis", "example_creation", "error_documentation", "versioning", "interactive_docs"]
      }
    },
    output_schema: "schemas/documentation-output.schema.json",
    streaming_events: ["doc_started", "section_completed", "review_needed", "doc_published"],
    dependencies: {
      required_before: ["coder_agent", "testing_agent", "prd_agent"],
      provides_to: ["all_agents", "external_stakeholders"]
    }
  };
}

// Generate Logger Agent JSON
function generateLoggerAgentJSON() {
  return {
    meta: {
      agent: "logger_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/logger_agent.md"
    },
    summary: "Specializes in monitoring, logging, and observability for proactive issue detection",
    capabilities: [
      "log_management",
      "real_time_monitoring",
      "anomaly_detection",
      "performance_analytics",
      "incident_alerting",
      "distributed_tracing"
    ],
    tools: [],  // Logger Agent uses monitoring platforms and log aggregation tools
    context_priorities: {
      "devops_agent": {
        critical: ["infrastructure_config", "deployment_events", "service_topology"],
        optional: ["scaling_events", "maintenance_windows", "backup_schedules"]
      },
      "coder_agent": {
        critical: ["error_handling", "performance_targets", "logging_points"],
        optional: ["debug_flags", "feature_flags", "api_metrics"]
      },
      "testing_agent": {
        critical: ["test_failures", "performance_benchmarks", "error_patterns"],
        optional: ["test_coverage", "load_test_results", "regression_tracking"]
      },
      "project_manager_agent": {
        critical: ["sla_requirements", "incident_priorities", "stakeholder_alerts"],
        optional: ["reporting_schedule", "compliance_requirements", "milestone_tracking"]
      }
    },
    workflows: {
      "incident_detection": {
        description: "Automated incident detection and alerting workflow",
        steps: ["metric_collection", "anomaly_detection", "alert_generation", "escalation", "tracking"]
      },
      "performance_monitoring": {
        description: "Continuous performance monitoring workflow",
        steps: ["baseline_establishment", "real_time_tracking", "trend_analysis", "capacity_planning"]
      }
    },
    output_schema: "schemas/logger-output.schema.json",
    streaming_events: ["alert_triggered", "anomaly_detected", "incident_started", "health_check"],
    dependencies: {
      required_before: ["devops_agent", "coder_agent"],
      provides_to: ["devops_agent", "analysis_agent", "project_manager_agent"]
    }
  };
}

// Generate Business Documents Agent JSON
function generateBusinessDocumentsAgentJSON() {
  return {
    meta: {
      agent: "business_documents_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/business_documents_agent.md"
    },
    summary: "Specializes in creating comprehensive business documentation including proposals, plans, and strategic reports",
    capabilities: [
      "business_planning",
      "proposal_development",
      "financial_documentation",
      "legal_compliance_docs",
      "operational_documentation",
      "strategic_communications"
    ],
    tools: [],  // Business Documents Agent primarily uses document creation and design tools
    context_priorities: {
      "finance_agent": {
        critical: ["financial_projections", "budget_summary", "roi_analysis"],
        optional: ["detailed_models", "scenario_analysis", "historical_data"]
      },
      "research_agent": {
        critical: ["market_analysis", "competitive_landscape", "target_audience"],
        optional: ["industry_trends", "regulatory_environment", "customer_feedback"]
      },
      "marketing_agent": {
        critical: ["value_proposition", "brand_guidelines", "positioning_strategy"],
        optional: ["campaign_results", "customer_personas", "messaging_framework"]
      },
      "analysis_agent": {
        critical: ["strategic_recommendations", "risk_assessment", "success_metrics"],
        optional: ["detailed_analysis", "data_visualizations", "scenario_planning"]
      }
    },
    workflows: {
      "business_plan_development": {
        description: "Comprehensive business plan creation workflow",
        steps: ["requirements_gathering", "market_analysis", "financial_modeling", "document_creation", "stakeholder_review"]
      },
      "proposal_creation": {
        description: "Winning proposal development workflow",
        steps: ["rfp_analysis", "solution_design", "pricing_strategy", "proposal_writing", "final_review"]
      }
    },
    output_schema: "schemas/business-documents-output.schema.json",
    streaming_events: ["document_started", "section_completed", "review_requested", "document_finalized"],
    dependencies: {
      required_before: ["finance_agent", "research_agent", "marketing_agent"],
      provides_to: ["project_manager_agent", "external_stakeholders"]
    }
  };
}

// Generate Email Marketing Agent JSON
function generateEmailMarketingAgentJSON() {
  return {
    meta: {
      agent: "email_marketing_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/email_marketing_agent.md"
    },
    summary: "Specializes in automated email marketing campaigns that drive revenue growth and customer retention",
    capabilities: [
      "email_automation",
      "lifecycle_campaigns",
      "segmentation_personalization",
      "revenue_optimization",
      "retention_campaigns",
      "deliverability_management"
    ],
    tools: [],  // Email Marketing Agent uses email platforms like Klaviyo, Mailchimp, SendGrid
    context_priorities: {
      "customer_lifecycle_agent": {
        critical: ["customer_segments", "lifecycle_stages", "retention_metrics"],
        optional: ["customer_behavior", "engagement_history", "health_scores"]
      },
      "revenue_optimization_agent": {
        critical: ["revenue_targets", "conversion_metrics", "upsell_opportunities"],
        optional: ["pricing_experiments", "revenue_attribution", "ltv_analysis"]
      },
      "marketing_agent": {
        critical: ["brand_voice", "messaging_framework", "campaign_calendar"],
        optional: ["content_library", "visual_assets", "competitive_messaging"]
      },
      "analytics_agent": {
        critical: ["email_performance", "conversion_funnels", "segment_performance"],
        optional: ["detailed_analytics", "attribution_models", "predictive_insights"]
      }
    },
    workflows: {
      "revenue_driven_campaigns": {
        description: "Revenue-focused email campaign automation workflow",
        steps: ["strategy_development", "segmentation", "content_creation", "automation_setup", "performance_optimization"]
      },
      "retention_automation": {
        description: "Customer retention and churn prevention workflow",
        steps: ["risk_identification", "trigger_setup", "personalization", "engagement_tracking", "win_back_campaigns"]
      }
    },
    output_schema: "schemas/email-marketing-output.schema.json",
    streaming_events: ["campaign_launched", "automation_triggered", "milestone_reached", "ab_test_complete"],
    dependencies: {
      required_before: ["customer_lifecycle_agent", "marketing_agent"],
      provides_to: ["revenue_optimization_agent", "analytics_agent"]
    }
  };
}

// Generate Analytics & Growth Intelligence Agent JSON
function generateAnalyticsGrowthIntelligenceAgentJSON() {
  return {
    meta: {
      agent: "analytics_growth_intelligence_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/analytics_growth_intelligence_agent.md"
    },
    summary: "Provides comprehensive business intelligence, growth analytics, and data-driven optimization strategies",
    capabilities: [
      "business_intelligence",
      "growth_analytics",
      "predictive_modeling",
      "customer_analytics",
      "performance_tracking",
      "strategic_insights"
    ],
    tools: [],  // Analytics Agent uses BI platforms like Tableau, Amplitude, Mixpanel
    context_priorities: {
      "revenue_optimization_agent": {
        critical: ["revenue_metrics", "pricing_performance", "expansion_metrics"],
        optional: ["pricing_experiments", "revenue_forecasts", "competitor_pricing"]
      },
      "customer_lifecycle_agent": {
        critical: ["retention_metrics", "customer_health", "lifecycle_stages"],
        optional: ["behavior_patterns", "intervention_results", "cohort_analysis"]
      },
      "marketing_agent": {
        critical: ["acquisition_metrics", "campaign_performance", "attribution_data"],
        optional: ["creative_performance", "audience_insights", "competitive_analysis"]
      },
      "testing_agent": {
        critical: ["experiment_results", "statistical_significance", "performance_metrics"],
        optional: ["test_details", "user_feedback", "technical_metrics"]
      }
    },
    workflows: {
      "business_intelligence": {
        description: "Business intelligence dashboard and revenue analytics workflow",
        steps: ["data_integration", "dashboard_development", "predictive_analytics", "reporting"]
      },
      "growth_experimentation": {
        description: "Growth experimentation and optimization analytics workflow",
        steps: ["hypothesis_generation", "experiment_design", "analysis", "optimization"]
      },
      "customer_journey": {
        description: "Customer journey analytics and attribution modeling workflow",
        steps: ["journey_mapping", "attribution_modeling", "behavioral_analytics", "optimization"]
      }
    },
    output_schema: "schemas/analytics-output.schema.json",
    streaming_events: ["metric_alert", "insight_discovered", "experiment_concluded", "forecast_updated"],
    dependencies: {
      required_before: [],
      provides_to: ["all_agents"],
      analyzes_data_from: ["all_agents"]
    }
  };
}

// Generate Customer Lifecycle & Retention Agent JSON
function generateCustomerLifecycleRetentionAgentJSON() {
  return {
    meta: {
      agent: "customer_lifecycle_retention_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/customer_lifecycle_retention_agent.md"
    },
    summary: "Maximizes customer lifetime value through strategic onboarding, retention, and expansion strategies",
    capabilities: [
      "onboarding_optimization",
      "churn_prevention",
      "customer_success",
      "expansion_automation",
      "retention_analytics",
      "lifecycle_management"
    ],
    tools: [],  // Customer Success platforms like Gainsight, ChurnZero, Intercom
    context_priorities: {
      "revenue_optimization_agent": {
        critical: ["subscription_tiers", "expansion_rules", "pricing_metrics"],
        optional: ["pricing_experiments", "competitor_analysis", "revenue_forecasts"]
      },
      "analytics_agent": {
        critical: ["customer_health_scores", "churn_predictions", "usage_analytics"],
        optional: ["cohort_analysis", "segment_performance", "predictive_models"]
      },
      "marketing_agent": {
        critical: ["customer_personas", "acquisition_sources", "brand_messaging"],
        optional: ["campaign_performance", "content_library", "competitive_messaging"]
      },
      "ui_ux_agent": {
        critical: ["onboarding_flows", "feature_discovery", "user_feedback"],
        optional: ["design_system", "usability_testing", "accessibility_features"]
      }
    },
    workflows: {
      "onboarding_activation": {
        description: "Customer onboarding and activation optimization workflow",
        steps: ["journey_design", "milestone_definition", "automation_setup", "measurement"]
      },
      "churn_prevention": {
        description: "Churn prediction and prevention system workflow",
        steps: ["health_scoring", "risk_identification", "intervention_design", "recovery_programs"]
      },
      "expansion_automation": {
        description: "Customer expansion and upselling automation workflow",
        steps: ["opportunity_identification", "trigger_automation", "success_driven_sales", "tracking"]
      }
    },
    output_schema: "schemas/customer-lifecycle-output.schema.json",
    streaming_events: ["health_decline", "expansion_opportunity", "milestone_achieved", "churn_risk_alert"],
    dependencies: {
      required_before: ["revenue_optimization_agent"],
      provides_to: ["analytics_agent", "marketing_agent", "email_marketing_agent"]
    }
  };
}

// Generate Document Manager Agent JSON
function generateDocumentManagerAgentJSON() {
  return {
    meta: {
      agent: "document_manager_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/document_manager_agent.md"
    },
    summary: "Creates and maintains machine-readable JSON versions of all documentation for context optimization",
    capabilities: [
      "json_generation",
      "file_synchronization",
      "schema_validation",
      "query_optimization",
      "context_reduction",
      "performance_monitoring"
    ],
    tools: [],  // Document Manager uses file system operations and JSON processing
    context_priorities: {
      "project_manager_agent": {
        critical: ["agent_priorities", "sprint_status", "blocker_alerts"],
        optional: ["task_schedules", "project_timeline", "resource_allocation"]
      },
      "all_active_agents": {
        critical: ["json_requests", "query_patterns", "performance_issues"],
        optional: ["usage_statistics", "data_preferences", "feedback"]
      }
    },
    workflows: {
      "json_generation": {
        description: "JSON generation and synchronization workflow",
        steps: ["file_detection", "queue_management", "data_extraction", "validation", "optimization"]
      }
    },
    output_schema: "schemas/document-manager-output.schema.json",
    streaming_events: ["generation_started", "generation_completed", "query_served", "validation_error"],
    dependencies: {
      required_before: [],
      provides_to: ["all_agents"],
      monitors: ["project-documents", "ai-agents", "aaa-documents"]
    }
  };
}

// Generate PPC Media Buyer Agent JSON
function generatePPCMediaBuyerAgentJSON() {
  return {
    meta: {
      agent: "ppc_media_buyer_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/ppc_media_buyer_agent.md"
    },
    summary: "Specializes in paid advertising campaign strategy, execution, and optimization across all major platforms",
    capabilities: [
      "campaign_strategy",
      "platform_management",
      "audience_targeting",
      "bid_optimization",
      "creative_testing",
      "performance_tracking"
    ],
    tools: [],  // PPC Media Buyer uses ad platforms like Google Ads, Meta Business Manager, LinkedIn Campaign Manager
    context_priorities: {
      "marketing_agent": {
        critical: ["campaign_strategy", "target_audience", "brand_guidelines", "conversion_goals"],
        optional: ["content_calendar", "competitive_messaging", "channel_performance"]
      },
      "finance_agent": {
        critical: ["advertising_budget", "cpa_targets", "roi_requirements"],
        optional: ["monthly_spend_trends", "ltv_data", "financial_forecasts"]
      },
      "analytics_agent": {
        critical: ["conversion_tracking", "performance_metrics", "attribution_model"],
        optional: ["historical_performance", "audience_insights", "funnel_analysis"]
      },
      "revenue_optimization_agent": {
        critical: ["revenue_targets", "pricing_strategy", "monetization_goals"],
        optional: ["customer_segments", "upsell_opportunities", "seasonal_trends"]
      }
    },
    workflows: {
      "product_launch_campaign": {
        description: "New product launch PPC campaign workflow",
        steps: ["campaign_strategy", "keyword_research", "campaign_setup", "launch_optimization", "performance_analysis"]
      },
      "lead_generation_optimization": {
        description: "Lead generation campaign optimization workflow",
        steps: ["campaign_audit", "optimization_strategy", "implementation_testing", "performance_monitoring", "results_analysis"]
      },
      "ecommerce_revenue_maximization": {
        description: "E-commerce revenue maximization workflow",
        steps: ["strategy_development", "feed_optimization", "multi_channel_deployment", "revenue_optimization", "performance_analysis"]
      }
    },
    output_schema: "schemas/ppc-output.schema.json",
    streaming_events: ["campaign_launched", "performance_alert", "budget_milestone", "optimization_complete"],
    dependencies: {
      required_before: ["marketing_agent", "finance_agent"],
      provides_to: ["analytics_agent", "revenue_optimization_agent", "project_manager_agent"]
    }
  };
}

// Generate Project Dashboard Agent JSON
function generateProjectDashboardAgentJSON() {
  return {
    meta: {
      agent: "project_dashboard_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/project_dashboard_agent.md"
    },
    summary: "Creates and maintains real-time project management dashboard for monitoring AI agent coordination",
    capabilities: [
      "real_time_monitoring",
      "document_visualization",
      "progress_tracking",
      "stakeholder_interaction",
      "agent_coordination_display",
      "websocket_updates"
    ],
    tools: ["chokidar", "socket.io", "react", "chart.js"],
    context_priorities: {
      "project_manager_agent": {
        critical: ["sprint_status", "milestone_status", "agent_assignments"],
        optional: ["sprint_history", "team_velocity", "retrospective_notes"]
      },
      "all_active_agents": {
        critical: ["agent_status", "document_created", "completion_events"],
        optional: ["agent_metrics", "error_logs", "coordination_data"]
      },
      "document_manager_agent": {
        critical: ["file_updates", "folder_structure", "document_metadata"],
        optional: ["version_history", "generation_queue", "performance_stats"]
      }
    },
    workflows: {
      "dashboard_deployment": {
        description: "Pre-built dashboard deployment workflow",
        steps: ["copy_dashboard", "dependency_modernization", "port_management", "launch"]
      },
      "real_time_monitoring": {
        description: "Real-time document and agent monitoring",
        steps: ["file_watching", "content_processing", "websocket_updates", "notifications"]
      }
    },
    output_schema: "schemas/dashboard-output.schema.json",
    streaming_events: ["dashboard_started", "agent_activity", "stakeholder_alert", "sprint_update"],
    dependencies: {
      required_before: [],
      provides_to: ["project_manager_agent", "all_agents"],
      monitors: ["project-documents", "agent_status"]
    }
  };
}

// Generate Revenue Optimization Agent JSON
function generateRevenueOptimizationAgentJSON() {
  return {
    meta: {
      agent: "revenue_optimization_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/revenue_optimization_agent.md"
    },
    summary: "Designs and optimizes revenue models focusing on subscription, recurring revenue, and monetization strategies",
    capabilities: [
      "subscription_model_design",
      "pricing_optimization",
      "revenue_stream_diversification",
      "customer_lifetime_value",
      "churn_prevention",
      "expansion_revenue"
    ],
    tools: ["stripe", "chargebee", "chartmogul", "profitwell"],
    context_priorities: {
      "research_agent": {
        critical: ["market_analysis", "competitive_pricing", "customer_research"],
        optional: ["industry_trends", "customer_interviews", "market_segments"]
      },
      "finance_agent": {
        critical: ["revenue_targets", "unit_economics", "profitability_requirements"],
        optional: ["financial_projections", "budget_constraints", "investment_plans"]
      },
      "customer_lifecycle_retention_agent": {
        critical: ["retention_metrics", "customer_segments", "expansion_opportunities"],
        optional: ["customer_health_scores", "success_milestones", "satisfaction_metrics"]
      },
      "analytics_growth_intelligence_agent": {
        critical: ["conversion_metrics", "usage_patterns", "revenue_analytics"],
        optional: ["cohort_analysis", "attribution_data", "experiment_results"]
      }
    },
    workflows: {
      "subscription_architecture": {
        description: "Subscription model design and optimization",
        steps: ["tier_design", "pricing_psychology", "billing_optimization", "analytics_setup"]
      },
      "revenue_diversification": {
        description: "Revenue stream diversification strategy",
        steps: ["opportunity_analysis", "passive_income", "partnerships", "integration"]
      }
    },
    output_schema: "schemas/revenue-optimization-output.schema.json",
    streaming_events: ["pricing_strategy_defined", "revenue_milestone", "experiment_completed", "churn_risk_identified"],
    dependencies: {
      required_before: ["market_validation_agent"],
      provides_to: ["finance_agent", "coder_agent", "marketing_agent"]
    }
  };
}

// Generate Social Media Agent JSON
function generateSocialMediaAgentJSON() {
  return {
    meta: {
      agent: "social_media_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/social_media_agent.md"
    },
    summary: "Manages social media strategy, content creation, and community engagement across all platforms",
    capabilities: [
      "platform_strategy",
      "content_creation",
      "community_management",
      "influencer_partnerships",
      "social_analytics",
      "crisis_management"
    ],
    tools: ["hootsuite", "buffer", "sprout_social", "canva", "brandwatch"],
    context_priorities: {
      "marketing_agent": {
        critical: ["brand_guidelines", "campaign_objectives", "target_audience"],
        optional: ["content_themes", "messaging_framework", "competitive_positioning"]
      },
      "analytics_growth_intelligence_agent": {
        critical: ["social_metrics", "engagement_analytics", "audience_insights"],
        optional: ["conversion_tracking", "attribution_data", "trend_analysis"]
      },
      "customer_lifecycle_retention_agent": {
        critical: ["customer_feedback", "support_requests", "community_health"],
        optional: ["customer_stories", "satisfaction_data", "advocacy_opportunities"]
      },
      "ppc_media_buyer_agent": {
        critical: ["ad_creative_performance", "audience_targeting", "budget_allocation"],
        optional: ["campaign_calendars", "creative_testing", "competitive_ads"]
      }
    },
    workflows: {
      "brand_launch_campaign": {
        description: "Social media brand launch workflow",
        steps: ["platform_strategy", "content_creation", "community_building", "launch_execution"]
      },
      "community_engagement": {
        description: "Community building and engagement optimization",
        steps: ["community_analysis", "content_strategy", "engagement_implementation", "analytics"]
      }
    },
    output_schema: "schemas/social-media-output.schema.json",
    streaming_events: ["viral_content", "influencer_mention", "community_milestone", "crisis_alert"],
    dependencies: {
      required_before: ["marketing_agent"],
      provides_to: ["analytics_agent", "ppc_media_buyer_agent", "customer_lifecycle_agent"]
    }
  };
}

// Generate VC Report Agent JSON
function generateVCReportAgentJSON() {
  return {
    meta: {
      agent: "vc_report_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/vc_report_agent.md"
    },
    summary: "Creates comprehensive investment documentation for venture capital fundraising",
    capabilities: [
      "pitch_deck_creation",
      "financial_modeling",
      "valuation_analysis",
      "investor_targeting",
      "due_diligence_prep",
      "investment_materials"
    ],
    tools: ["pitchbook", "crunchbase", "canva", "excel"],
    context_priorities: {
      "finance_agent": {
        critical: ["financial_projections", "unit_economics", "funding_requirements"],
        optional: ["historical_financials", "scenario_analysis", "burn_rate_details"]
      },
      "research_agent": {
        critical: ["market_size", "competitive_landscape", "market_trends"],
        optional: ["customer_interviews", "industry_reports", "regulatory_environment"]
      },
      "business_documents_agent": {
        critical: ["business_model", "value_proposition", "team_profiles"],
        optional: ["company_history", "partnerships", "intellectual_property"]
      },
      "analytics_growth_intelligence_agent": {
        critical: ["growth_metrics", "engagement_data", "market_validation"],
        optional: ["cohort_analysis", "acquisition_channels", "predictive_models"]
      }
    },
    workflows: {
      "investment_package": {
        description: "Complete investment package creation",
        steps: ["opportunity_assessment", "financial_modeling", "market_analysis", "materials_creation"]
      },
      "pitch_deck": {
        description: "Pitch deck development workflow",
        steps: ["story_development", "slide_creation", "visual_design", "refinement"]
      }
    },
    output_schema: "schemas/vc-report-output.schema.json",
    streaming_events: ["pitch_deck_created", "financial_model_updated", "investor_match", "valuation_calculated"],
    dependencies: {
      required_before: ["finance_agent", "research_agent"],
      provides_to: ["project_manager_agent", "business_documents_agent"]
    }
  };
}

// Generate Market Validation & Product-Market Fit Agent JSON
function generateMarketValidationProductMarketFitAgentJSON() {
  return {
    meta: {
      agent: "market_validation_product_market_fit_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/market_validation_product_market_fit_agent.md"
    },
    summary: "Validates market demand and optimizes product-market fit through customer research and data analysis",
    capabilities: [
      "market_validation",
      "customer_discovery",
      "pmf_measurement",
      "mvp_strategy",
      "competitive_intelligence",
      "pricing_validation"
    ],
    tools: ["typeform", "surveymonkey", "google_trends", "mixpanel", "amplitude"],
    context_priorities: {
      "research_agent": {
        critical: ["market_analysis", "competitive_landscape", "target_segments"],
        optional: ["industry_trends", "regulatory_factors", "technology_landscape"]
      },
      "revenue_optimization_agent": {
        critical: ["pricing_hypotheses", "revenue_models", "willingness_to_pay"],
        optional: ["pricing_experiments", "revenue_projections", "competitor_pricing"]
      },
      "customer_lifecycle_retention_agent": {
        critical: ["customer_feedback", "retention_data", "satisfaction_metrics"],
        optional: ["customer_journeys", "support_tickets", "feature_requests"]
      },
      "analytics_growth_intelligence_agent": {
        critical: ["usage_patterns", "feature_adoption", "engagement_metrics"],
        optional: ["cohort_analysis", "funnel_metrics", "behavioral_data"]
      }
    },
    workflows: {
      "pre_build_validation": {
        description: "Pre-build market validation and customer discovery",
        steps: ["market_opportunity", "customer_problem_validation", "competitive_analysis", "solution_fit"]
      },
      "pmf_measurement": {
        description: "Product-market fit measurement and optimization",
        steps: ["pmf_assessment", "data_collection", "gap_analysis", "optimization_strategy"]
      }
    },
    output_schema: "schemas/market-validation-output.schema.json",
    streaming_events: ["validation_milestone", "pmf_measurement", "market_signal", "customer_insight"],
    dependencies: {
      required_before: [],
      provides_to: ["prd_agent", "marketing_agent", "revenue_optimization_agent"]
    }
  };
}

// Generate Optimization Agent JSON
function generateOptimizationAgentJSON() {
  return {
    meta: {
      agent: "optimization_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/optimization_agent.md"
    },
    summary: "Specializes in continuous improvement of performance, efficiency, and operational excellence",
    capabilities: [
      "performance_analysis",
      "process_improvement",
      "cost_optimization",
      "continuous_improvement",
      "bottleneck_identification",
      "resource_optimization"
    ],
    tools: ["new_relic", "datadog", "grafana", "jmeter"],
    context_priorities: {
      "all_active_agents": {
        critical: ["performance_metrics", "resource_utilization", "process_timings"],
        optional: ["detailed_logs", "historical_trends", "benchmark_data"]
      },
      "devops_agent": {
        critical: ["infrastructure_metrics", "deployment_stats", "cost_data"],
        optional: ["scaling_events", "incident_reports", "capacity_forecasts"]
      },
      "project_manager_agent": {
        critical: ["sprint_velocity", "bottleneck_reports", "resource_allocation"],
        optional: ["task_dependencies", "team_feedback", "planning_metrics"]
      },
      "testing_agent": {
        critical: ["test_performance", "quality_metrics", "automation_stats"],
        optional: ["test_patterns", "environment_usage", "manual_effort"]
      }
    },
    workflows: {
      "performance_optimization": {
        description: "System performance optimization workflow",
        steps: ["assessment", "strategy", "implementation", "results_analysis"]
      },
      "process_optimization": {
        description: "Process improvement and efficiency workflow",
        steps: ["analysis", "design", "pilot", "deployment"]
      }
    },
    output_schema: "schemas/optimization-output.schema.json",
    streaming_events: ["bottleneck_detected", "cost_saving_identified", "process_optimization", "performance_milestone"],
    dependencies: {
      required_before: [],
      provides_to: ["all_agents"],
      monitors: ["all_processes"]
    }
  };
}

// Generate Project Analyzer Agent JSON
function generateProjectAnalyzerAgentJSON() {
  return {
    meta: {
      agent: "project_analyzer_agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      source_file: "ai-agents/project_analyzer_agent.md"
    },
    summary: "Analyzes existing codebases and creates comprehensive documentation for AI agent integration",
    capabilities: [
      "codebase_analysis",
      "architecture_mapping",
      "technology_identification",
      "documentation_generation",
      "dependency_analysis",
      "security_assessment"
    ],
    tools: ["sonarqube", "dependency_cruiser", "madge", "jsdoc"],
    context_priorities: {
      "project_files": {
        critical: ["package_json", "config_files", "file_structure"],
        optional: ["readme_files", "test_configs", "ci_cd_configs"]
      },
      "security_agent": {
        critical: ["vulnerability_scan", "dependency_audit", "security_config"],
        optional: ["threat_model", "compliance_status", "audit_logs"]
      },
      "devops_agent": {
        critical: ["infrastructure_config", "deployment_scripts", "environment_vars"],
        optional: ["monitoring_config", "scaling_policies", "backup_strategies"]
      }
    },
    workflows: {
      "complete_analysis": {
        description: "Complete existing project analysis workflow",
        steps: ["discovery", "technology_analysis", "code_quality", "feature_mapping", "documentation"]
      },
      "legacy_modernization": {
        description: "Legacy system modernization analysis",
        steps: ["assessment", "opportunities", "architecture_evolution", "risk_analysis", "roadmap"]
      }
    },
    output_schema: "schemas/project-analysis-output.schema.json",
    streaming_events: ["analysis_started", "vulnerability_found", "pattern_detected", "analysis_completed"],
    dependencies: {
      required_before: ["all_agents"],
      provides_to: ["prd_agent", "coder_agent", "devops_agent", "security_agent"]
    }
  };
}

// Main function
function main() {
  const outputPath = path.join(__dirname, 'ai-agents-json');
  ensureDir(outputPath);
  
  console.log('📄 Generating agent JSON files...');
  
  // Generate PRD Agent JSON
  const prdJson = generatePRDAgentJSON();
  writeJSON(path.join(outputPath, 'prd_agent.json'), prdJson);
  console.log('✅ Generated: prd_agent.json');
  
  // Generate Coder Agent JSON
  const coderJson = generateCoderAgentJSON();
  writeJSON(path.join(outputPath, 'coder_agent.json'), coderJson);
  console.log('✅ Generated: coder_agent.json');
  
  // Generate Testing Agent JSON
  const testingJson = generateTestingAgentJSON();
  writeJSON(path.join(outputPath, 'testing_agent.json'), testingJson);
  console.log('✅ Generated: testing_agent.json');
  
  // Generate Research Agent JSON
  const researchJson = generateResearchAgentJSON();
  writeJSON(path.join(outputPath, 'research_agent.json'), researchJson);
  console.log('✅ Generated: research_agent.json');
  
  // Generate Marketing Agent JSON
  const marketingJson = generateMarketingAgentJSON();
  writeJSON(path.join(outputPath, 'marketing_agent.json'), marketingJson);
  console.log('✅ Generated: marketing_agent.json');
  
  // Generate Finance Agent JSON
  const financeJson = generateFinanceAgentJSON();
  writeJSON(path.join(outputPath, 'finance_agent.json'), financeJson);
  console.log('✅ Generated: finance_agent.json');
  
  // Generate Analysis Agent JSON
  const analysisJson = generateAnalysisAgentJSON();
  writeJSON(path.join(outputPath, 'analysis_agent.json'), analysisJson);
  console.log('✅ Generated: analysis_agent.json');
  
  // Generate UI/UX Agent JSON
  const uiuxJson = generateUIUXAgentJSON();
  writeJSON(path.join(outputPath, 'ui_ux_agent.json'), uiuxJson);
  console.log('✅ Generated: ui_ux_agent.json');
  
  // Generate Project Manager Agent JSON
  const pmJson = generateProjectManagerAgentJSON();
  writeJSON(path.join(outputPath, 'project_manager_agent.json'), pmJson);
  console.log('✅ Generated: project_manager_agent.json');
  
  // Generate DevOps Agent JSON
  const devopsJson = generateDevOpsAgentJSON();
  writeJSON(path.join(outputPath, 'devops_agent.json'), devopsJson);
  console.log('✅ Generated: devops_agent.json');
  
  // Generate SEO Agent JSON
  const seoJson = generateSEOAgentJSON();
  writeJSON(path.join(outputPath, 'seo_agent.json'), seoJson);
  console.log('✅ Generated: seo_agent.json');
  
  // Generate ML Agent JSON
  const mlJson = generateMLAgentJSON();
  writeJSON(path.join(outputPath, 'ml_agent.json'), mlJson);
  console.log('✅ Generated: ml_agent.json');
  
  // Generate DBA Agent JSON
  const dbaJson = generateDBAAgentJSON();
  writeJSON(path.join(outputPath, 'dba_agent.json'), dbaJson);
  console.log('✅ Generated: dba_agent.json');
  
  // Generate Data Engineer Agent JSON
  const dataEngineerJson = generateDataEngineerAgentJSON();
  writeJSON(path.join(outputPath, 'data_engineer_agent.json'), dataEngineerJson);
  console.log('✅ Generated: data_engineer_agent.json');
  
  // Generate Security Agent JSON
  const securityJson = generateSecurityAgentJSON();
  writeJSON(path.join(outputPath, 'security_agent.json'), securityJson);
  console.log('✅ Generated: security_agent.json');
  
  // Generate API Agent JSON
  const apiJson = generateAPIAgentJSON();
  writeJSON(path.join(outputPath, 'api_agent.json'), apiJson);
  console.log('✅ Generated: api_agent.json');
  
  // Generate LLM Agent JSON
  const llmJson = generateLLMAgentJSON();
  writeJSON(path.join(outputPath, 'llm_agent.json'), llmJson);
  console.log('✅ Generated: llm_agent.json');
  
  // Generate MCP Agent JSON
  const mcpJson = generateMCPAgentJSON();
  writeJSON(path.join(outputPath, 'mcp_agent.json'), mcpJson);
  console.log('✅ Generated: mcp_agent.json');
  
  // Generate Documentation Agent JSON
  const documentationJson = generateDocumentationAgentJSON();
  writeJSON(path.join(outputPath, 'documentator_agent.json'), documentationJson);
  console.log('✅ Generated: documentator_agent.json');
  
  // Generate Logger Agent JSON
  const loggerJson = generateLoggerAgentJSON();
  writeJSON(path.join(outputPath, 'logger_agent.json'), loggerJson);
  console.log('✅ Generated: logger_agent.json');
  
  // Generate Business Documents Agent JSON
  const businessDocumentsJson = generateBusinessDocumentsAgentJSON();
  writeJSON(path.join(outputPath, 'business_documents_agent.json'), businessDocumentsJson);
  console.log('✅ Generated: business_documents_agent.json');
  
  // Generate Email Marketing Agent JSON
  const emailMarketingJson = generateEmailMarketingAgentJSON();
  writeJSON(path.join(outputPath, 'email_marketing_agent.json'), emailMarketingJson);
  console.log('✅ Generated: email_marketing_agent.json');
  
  // Generate PPC Media Buyer Agent JSON
  const ppcMediaBuyerJson = generatePPCMediaBuyerAgentJSON();
  writeJSON(path.join(outputPath, 'ppc_media_buyer_agent.json'), ppcMediaBuyerJson);
  console.log('✅ Generated: ppc_media_buyer_agent.json');
  
  // Generate Analytics & Growth Intelligence Agent JSON
  const analyticsJson = generateAnalyticsGrowthIntelligenceAgentJSON();
  writeJSON(path.join(outputPath, 'analytics_growth_intelligence_agent.json'), analyticsJson);
  console.log('✅ Generated: analytics_growth_intelligence_agent.json');
  
  // Generate Customer Lifecycle & Retention Agent JSON
  const customerLifecycleJson = generateCustomerLifecycleRetentionAgentJSON();
  writeJSON(path.join(outputPath, 'customer_lifecycle_retention_agent.json'), customerLifecycleJson);
  console.log('✅ Generated: customer_lifecycle_retention_agent.json');
  
  // Generate Document Manager Agent JSON
  const documentManagerJson = generateDocumentManagerAgentJSON();
  writeJSON(path.join(outputPath, 'document_manager_agent.json'), documentManagerJson);
  console.log('✅ Generated: document_manager_agent.json');
  
  // Generate Project Dashboard Agent JSON
  const projectDashboardJson = generateProjectDashboardAgentJSON();
  writeJSON(path.join(outputPath, 'project_dashboard_agent.json'), projectDashboardJson);
  console.log('✅ Generated: project_dashboard_agent.json');
  
  // Generate Revenue Optimization Agent JSON
  const revenueOptimizationJson = generateRevenueOptimizationAgentJSON();
  writeJSON(path.join(outputPath, 'revenue_optimization_agent.json'), revenueOptimizationJson);
  console.log('✅ Generated: revenue_optimization_agent.json');
  
  // Generate Social Media Agent JSON
  const socialMediaJson = generateSocialMediaAgentJSON();
  writeJSON(path.join(outputPath, 'social_media_agent.json'), socialMediaJson);
  console.log('✅ Generated: social_media_agent.json');
  
  // Generate VC Report Agent JSON
  const vcReportJson = generateVCReportAgentJSON();
  writeJSON(path.join(outputPath, 'vc_report_agent.json'), vcReportJson);
  console.log('✅ Generated: vc_report_agent.json');
  
  // Generate Market Validation & Product-Market Fit Agent JSON
  const marketValidationJson = generateMarketValidationProductMarketFitAgentJSON();
  writeJSON(path.join(outputPath, 'market_validation_product_market_fit_agent.json'), marketValidationJson);
  console.log('✅ Generated: market_validation_product_market_fit_agent.json');
  
  // Generate Optimization Agent JSON
  const optimizationJson = generateOptimizationAgentJSON();
  writeJSON(path.join(outputPath, 'optimization_agent.json'), optimizationJson);
  console.log('✅ Generated: optimization_agent.json');
  
  // Generate Project Analyzer Agent JSON
  const projectAnalyzerJson = generateProjectAnalyzerAgentJSON();
  writeJSON(path.join(outputPath, 'project_analyzer_agent.json'), projectAnalyzerJson);
  console.log('✅ Generated: project_analyzer_agent.json');
  
  console.log('📄 JSON generation complete!');
}

// Run
main();