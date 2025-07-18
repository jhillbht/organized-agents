# BMAD Methodology Reference

## Table of Contents

1. [Introduction](#introduction)
2. [Core Principles](#core-principles)
3. [The Five-Phase Workflow](#the-five-phase-workflow)
4. [Agent Roles & Responsibilities](#agent-roles--responsibilities)
5. [File-Based Coordination](#file-based-coordination)
6. [Communication Patterns](#communication-patterns)
7. [Quality Gates](#quality-gates)
8. [Best Practices](#best-practices)
9. [Advanced Patterns](#advanced-patterns)
10. [Glossary](#glossary)

## Introduction

The Breakthrough Method for Agile AI-Driven Development (BMAD) is a comprehensive methodology designed to coordinate AI agents effectively in software development projects. This reference provides detailed information about BMAD concepts, processes, and implementation strategies.

### What Makes BMAD Different?

- **AI-First Design**: Built specifically for AI agent coordination
- **Phase-Based Structure**: Clear progression through development stages
- **File-Based State**: Persistent, version-controlled coordination
- **Quality Gates**: Built-in quality assurance at each phase
- **Transparent Communication**: All decisions and handoffs are documented

## Core Principles

### 1. Structured Coordination

BMAD provides a framework where each agent knows:
- What phase the project is in
- What their responsibilities are
- When to engage and when to hand off
- How to communicate with other agents

### 2. Context Preservation

All project context is preserved through:
- File-based state management
- Structured communication logs
- Decision documentation
- Comprehensive handoff procedures

### 3. Quality-First Approach

Quality is built into the methodology through:
- Phase-specific quality gates
- Automated validation checks
- Peer review processes
- Continuous improvement loops

### 4. Transparency & Accountability

Every action in BMAD is:
- Documented in the file system
- Traceable to specific agents
- Reviewable by all stakeholders
- Auditable for compliance

## The Five-Phase Workflow

### Phase 1: Planning 🎯

**Purpose**: Establish project foundation and direction

**Key Activities**:
- Requirements gathering and analysis
- Market research and competitive analysis
- Technical feasibility assessment
- Architecture design and technology selection
- Resource planning and timeline estimation
- Risk identification and mitigation planning

**Primary Agents**:
- **Analyst**: Conducts market research and requirements analysis
- **Architect**: Designs system architecture and technical approach
- **Product Manager**: Defines product vision and strategy

**Deliverables**:
- Requirements documentation
- Architecture design documents
- Project timeline and milestones
- Risk assessment report

**Quality Gates**:
- Requirements completeness check
- Architecture review
- Stakeholder approval
- Resource allocation confirmation

**Exit Criteria**:
- All requirements documented and approved
- Architecture design reviewed and accepted
- Timeline and resources confirmed
- Risks identified with mitigation plans

### Phase 2: Story Creation 📝

**Purpose**: Transform requirements into actionable development tasks

**Key Activities**:
- Breaking down features into user stories
- Writing detailed acceptance criteria
- Prioritizing stories based on value and dependencies
- Estimating story complexity and effort
- Creating story dependencies map
- Defining definition of done

**Primary Agents**:
- **Product Owner**: Creates and prioritizes user stories
- **Scrum Master**: Facilitates story refinement
- **UX Expert**: Provides design input for stories

**Deliverables**:
- User story backlog
- Story prioritization matrix
- Acceptance criteria documentation
- Story point estimates
- Dependency diagrams

**Quality Gates**:
- Story completeness validation
- Acceptance criteria review
- Dependency conflict check
- Estimation reasonableness

**Exit Criteria**:
- All stories have clear acceptance criteria
- Backlog is prioritized and estimated
- Dependencies are identified and manageable
- Team capacity aligns with story estimates

### Phase 3: Development 💻

**Purpose**: Implement features according to stories

**Key Activities**:
- Code implementation
- Unit testing
- Code reviews
- Integration work
- Documentation updates
- Continuous integration/deployment

**Primary Agents**:
- **Developer**: Implements features and fixes bugs
- **Architect**: Provides technical guidance
- **Scrum Master**: Removes impediments

**Deliverables**:
- Implemented features
- Unit tests
- Code documentation
- Integration tests
- Updated technical documentation

**Quality Gates**:
- Code review approval
- Unit test coverage threshold
- Build success
- Integration test passage
- Documentation completeness

**Exit Criteria**:
- All planned stories implemented
- Code review completed for all changes
- Tests passing with required coverage
- Documentation updated
- No critical bugs remaining

### Phase 4: Quality Assurance ✅

**Purpose**: Ensure software meets quality standards

**Key Activities**:
- Comprehensive testing (unit, integration, E2E)
- Security vulnerability scanning
- Performance testing and optimization
- Accessibility testing
- User acceptance testing
- Bug tracking and resolution

**Primary Agents**:
- **QA Engineer**: Executes test plans and reports issues
- **Developer**: Fixes identified bugs
- **UX Expert**: Validates user experience

**Deliverables**:
- Test execution reports
- Bug reports and resolutions
- Performance benchmarks
- Security assessment report
- UAT sign-off

**Quality Gates**:
- All test suites passing
- No critical or high-priority bugs
- Performance metrics met
- Security scan clear
- Accessibility compliance verified

**Exit Criteria**:
- All planned tests executed
- Bug count within acceptable threshold
- Performance targets achieved
- Security requirements met
- Stakeholder acceptance received

### Phase 5: Complete 🎉

**Purpose**: Finalize project and prepare for deployment/handoff

**Key Activities**:
- Final deployment preparation
- Documentation finalization
- Knowledge transfer sessions
- Project retrospective
- Lessons learned documentation
- Maintenance planning

**Primary Agents**:
- **Product Manager**: Coordinates release
- **Scrum Master**: Facilitates retrospective
- **All Agents**: Contribute to documentation

**Deliverables**:
- Deployment package
- Complete documentation set
- Retrospective report
- Maintenance guidelines
- Knowledge transfer materials

**Quality Gates**:
- Deployment checklist complete
- Documentation review passed
- Knowledge transfer confirmed
- Retrospective conducted
- Handoff accepted

**Exit Criteria**:
- Software deployed or ready for deployment
- All documentation complete and reviewed
- Knowledge successfully transferred
- Retrospective insights captured
- Project formally closed

## Agent Roles & Responsibilities

### Business Intelligence Agents

#### Analyst
**Responsibilities**:
- Market research and competitive analysis
- User needs identification
- Requirements elicitation and documentation
- Business case development
- ROI analysis

**Key Interactions**:
- Provides requirements to Product Manager
- Collaborates with Architect on feasibility
- Shares insights with UX Expert

#### Product Manager
**Responsibilities**:
- Product vision and strategy
- Roadmap development
- Stakeholder management
- Feature prioritization
- Release planning

**Key Interactions**:
- Works with Analyst on market positioning
- Guides Product Owner on priorities
- Coordinates with Scrum Master on delivery

#### Product Owner
**Responsibilities**:
- User story creation
- Acceptance criteria definition
- Backlog management
- Sprint planning participation
- User acceptance coordination

**Key Interactions**:
- Translates Product Manager vision to stories
- Clarifies requirements for Developer
- Validates implementations with QA Engineer

### Technical Agents

#### Architect
**Responsibilities**:
- System design and architecture
- Technology selection
- Technical standards definition
- Integration strategy
- Performance architecture

**Key Interactions**:
- Guides Developer on implementation
- Reviews code for architectural compliance
- Collaborates with QA on test strategy

#### Developer
**Responsibilities**:
- Feature implementation
- Bug fixing
- Code optimization
- Technical documentation
- Peer code reviews

**Key Interactions**:
- Implements stories from Product Owner
- Follows Architect guidance
- Fixes issues found by QA Engineer

#### QA Engineer
**Responsibilities**:
- Test strategy development
- Test execution
- Bug identification and tracking
- Quality metrics reporting
- Automation development

**Key Interactions**:
- Tests Developer implementations
- Reports issues to team
- Validates acceptance criteria with Product Owner

### Process Agents

#### Scrum Master
**Responsibilities**:
- Process facilitation
- Impediment removal
- Team coordination
- Ceremony organization
- Metrics tracking

**Key Interactions**:
- Coordinates all team members
- Facilitates communication
- Resolves conflicts

#### UX Expert
**Responsibilities**:
- User experience design
- Usability testing
- Design system maintenance
- Accessibility compliance
- User research

**Key Interactions**:
- Provides designs to Developer
- Validates implementations
- Works with Product Owner on user needs

### Coordination Agent

#### BMAD Orchestrator
**Responsibilities**:
- Overall project coordination
- Phase transition management
- Agent dispatch
- Conflict resolution
- Progress monitoring

**Key Interactions**:
- Coordinates all agents
- Manages phase transitions
- Resolves inter-agent conflicts
- Reports to stakeholders

## File-Based Coordination

### Directory Structure

```
project-root/
├── .bmad/
│   ├── state.yaml                 # Current project state
│   ├── config.yaml                # Project configuration
│   ├── agents.yaml                # Agent assignments and status
│   │
│   ├── communications/            # All agent communications
│   │   ├── agent-handoffs/        # Work transfer messages
│   │   ├── status-updates/        # Progress reports
│   │   ├── blockers/              # Impediment reports
│   │   ├── questions/             # Clarification requests
│   │   └── decisions/             # Decision records
│   │
│   ├── stories/                   # User stories and tasks
│   │   ├── backlog/               # Unstarted stories
│   │   ├── active/                # In-progress stories
│   │   ├── review/                # Stories under review
│   │   ├── testing/               # Stories in QA
│   │   └── completed/             # Finished stories
│   │
│   ├── quality/                   # Quality assurance records
│   │   ├── reviews/               # Code and design reviews
│   │   ├── tests/                 # Test results and reports
│   │   ├── security/              # Security assessments
│   │   └── performance/           # Performance metrics
│   │
│   └── documentation/             # Project documentation
│       ├── requirements/          # Requirements docs
│       ├── architecture/          # Design documents
│       ├── api/                   # API documentation
│       └── user-guides/           # End-user documentation
```

### State Management

#### state.yaml
```yaml
version: 1.0
project:
  id: "proj_123"
  name: "E-commerce Platform"
  type: "web_app"
  created_at: "2024-01-15T10:00:00Z"
  
current_phase: "development"
phase_started_at: "2024-02-01T09:00:00Z"

progress:
  total_stories: 25
  completed_stories: 18
  active_story: "STORY-019"
  
agents:
  developer:
    status: "active"
    current_task: "Implementing payment gateway"
    last_update: "2024-02-15T14:30:00Z"
  qa_engineer:
    status: "waiting"
    blocked_by: "STORY-018"
    last_update: "2024-02-15T13:00:00Z"
```

### Communication Files

#### Handoff Message Format
```markdown
---
from: developer
to: qa_engineer
type: handoff
priority: high
timestamp: 2024-02-15T15:00:00Z
story_id: STORY-018
---

# Handoff: Payment Gateway Implementation

## Completed Work
- Implemented Stripe payment integration
- Added error handling for failed payments
- Created unit tests with 95% coverage

## Testing Notes
- Test cards are configured in test environment
- Rate limiting is set to 100 requests/minute
- Webhook endpoints need E2E testing

## Known Issues
- None identified

## Next Steps
Please conduct comprehensive testing including:
1. Payment success flows
2. Payment failure scenarios
3. Webhook reliability
4. Performance under load
```

## Communication Patterns

### Message Types

#### 1. Handoff Messages
- **Purpose**: Transfer work between agents
- **Required Fields**: From, To, Story ID, Completed Work, Next Steps
- **Best Practices**: Include context, testing notes, known issues

#### 2. Status Updates
- **Purpose**: Regular progress reports
- **Required Fields**: Agent, Phase, Progress, Blockers
- **Frequency**: Daily or on significant progress

#### 3. Blocker Reports
- **Purpose**: Escalate impediments
- **Required Fields**: Blocking Issue, Impact, Needed Resolution
- **Priority**: Always high

#### 4. Questions
- **Purpose**: Seek clarification
- **Required Fields**: Question, Context, Urgency
- **Response Time**: Based on urgency level

#### 5. Decision Records
- **Purpose**: Document important decisions
- **Required Fields**: Decision, Rationale, Participants, Impact
- **Retention**: Permanent

### Communication Best Practices

1. **Be Specific**: Include relevant details and context
2. **Use Templates**: Maintain consistency in message format
3. **Set Priority**: Help recipients manage their response time
4. **Include References**: Link to related stories, code, or documents
5. **Follow Up**: Ensure critical messages receive responses

## Quality Gates

### Implementation

Quality gates are checkpoints that ensure work meets standards before proceeding:

```yaml
quality_gates:
  development:
    - code_review:
        required: true
        approvers: 1
        criteria:
          - "No critical issues"
          - "Follows coding standards"
          - "Adequate test coverage"
    
    - automated_tests:
        required: true
        thresholds:
          unit_test_coverage: 80
          integration_tests: "passing"
          build_status: "success"
    
    - documentation:
        required: true
        includes:
          - "API documentation"
          - "Code comments"
          - "README updates"
```

### Gate Types

#### 1. Code Quality Gates
- **Static Analysis**: No critical violations
- **Code Coverage**: Minimum 80% for new code
- **Complexity**: Cyclomatic complexity < 10
- **Duplication**: < 5% duplicate code

#### 2. Testing Gates
- **Unit Tests**: All passing, adequate coverage
- **Integration Tests**: Key paths covered
- **E2E Tests**: Critical user journeys validated
- **Performance Tests**: Meet SLA requirements

#### 3. Security Gates
- **Vulnerability Scan**: No high/critical issues
- **Dependency Check**: No vulnerable dependencies
- **Code Review**: Security patterns followed
- **Penetration Test**: Passed for production

#### 4. Documentation Gates
- **API Docs**: All endpoints documented
- **User Guides**: Features documented
- **Technical Docs**: Architecture current
- **Inline Comments**: Complex logic explained

### Remediation Process

When a quality gate fails:

1. **Identification**: System identifies failure
2. **Notification**: Relevant agents notified
3. **Analysis**: Root cause determined
4. **Remediation**: Issues addressed
5. **Re-validation**: Gate check repeated
6. **Documentation**: Failure and fix recorded

## Best Practices

### Project Setup

1. **Start Small**: Begin with a simple project to learn BMAD
2. **Use Defaults**: Default configurations are well-tested
3. **Enable All Gates**: Start strict, relax if needed
4. **Document Early**: Set documentation patterns from the beginning

### Phase Management

1. **Complete Prerequisites**: Don't skip phase requirements
2. **Regular Reviews**: Check phase progress daily
3. **Clean Transitions**: Ensure clean handoffs between phases
4. **Retrospectives**: Learn from each phase

### Agent Coordination

1. **Clear Assignments**: One agent per task
2. **Defined Boundaries**: Clear role responsibilities
3. **Regular Communication**: Daily status updates
4. **Escalation Paths**: Know when to escalate

### Communication

1. **Use Templates**: Consistent message formats
2. **Be Concise**: Clear, actionable communication
3. **Set Context**: Include necessary background
4. **Follow Up**: Ensure understanding

### Quality Management

1. **Automate Checks**: Reduce manual quality work
2. **Early Testing**: Test as you develop
3. **Continuous Improvement**: Refine gates based on results
4. **Document Failures**: Learn from quality issues

## Advanced Patterns

### Multi-Team Coordination

For large projects with multiple teams:

```yaml
teams:
  frontend:
    lead: senior_developer_1
    members: [developer_1, developer_2, ux_expert_1]
    focus: "User interface implementation"
    
  backend:
    lead: architect_1
    members: [developer_3, developer_4]
    focus: "API and services"
    
  qa:
    lead: qa_engineer_1
    members: [qa_engineer_2, qa_engineer_3]
    focus: "Comprehensive testing"
```

### Parallel Development Streams

Managing multiple features simultaneously:

```yaml
streams:
  feature_a:
    phase: "development"
    assigned_to: ["developer_1", "qa_engineer_1"]
    dependencies: []
    
  feature_b:
    phase: "planning"
    assigned_to: ["analyst_1", "architect_1"]
    dependencies: ["feature_a"]
    
  feature_c:
    phase: "development"
    assigned_to: ["developer_2", "qa_engineer_2"]
    dependencies: []
```

### Custom Agent Types

Extending BMAD with specialized agents:

```yaml
custom_agents:
  security_specialist:
    role: "Security analysis and compliance"
    phases: ["planning", "development", "qa"]
    responsibilities:
      - "Security architecture review"
      - "Vulnerability assessment"
      - "Compliance validation"
      
  data_scientist:
    role: "ML/AI feature development"
    phases: ["planning", "development"]
    responsibilities:
      - "Model design"
      - "Data pipeline creation"
      - "Model validation"
```

### Integration Patterns

#### CI/CD Integration
```yaml
integrations:
  ci_cd:
    provider: "github_actions"
    triggers:
      - event: "story_completed"
        action: "run_tests"
      - event: "phase_complete"
        action: "deploy_staging"
```

#### External Tool Integration
```yaml
integrations:
  issue_tracking:
    provider: "jira"
    sync:
      - bmad_stories: "jira_issues"
      - bmad_phases: "jira_epics"
```

## Glossary

**Agent**: An AI-powered or human entity responsible for specific tasks in the development process

**BMAD**: Breakthrough Method for Agile AI-Driven Development

**Blocker**: An impediment preventing progress on a task or story

**Handoff**: The process of transferring work from one agent to another

**Phase**: A major stage in the BMAD workflow (Planning, Story Creation, Development, QA, Complete)

**Quality Gate**: A checkpoint that ensures work meets defined standards

**Story**: A unit of work that delivers value to users

**State File**: The YAML file tracking current project status

**Orchestrator**: The central coordinator managing all agents and phases

---

## Appendix: Quick Reference

### Phase Transition Checklist

- [ ] Current phase exit criteria met
- [ ] All quality gates passed
- [ ] Handoff documentation complete
- [ ] Next phase agents notified
- [ ] State file updated
- [ ] Stakeholders informed

### Daily Coordination Checklist

- [ ] Review communication board
- [ ] Check agent status
- [ ] Update progress metrics
- [ ] Address blockers
- [ ] Plan next activities
- [ ] Send status update

### Quality Gate Checklist

- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Security scan clean
- [ ] Performance validated
- [ ] Accessibility checked