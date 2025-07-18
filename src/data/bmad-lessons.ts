import { BMadLesson, BMadExercise } from '@/types/bmad-education';
import { BMadPhase } from '@/types/bmad';

/**
 * Core BMAD Methodology Lessons
 * 7 comprehensive lessons covering all aspects of the BMAD methodology
 */
export const BMAD_CORE_LESSONS: BMadLesson[] = [
  {
    id: 'bmad-fundamentals',
    title: 'BMAD Fundamentals',
    description: 'Master the core principles of the Breakthrough Method for Agile AI-Driven Development',
    phase: 'general',
    content: {
      introduction: 'BMAD is a revolutionary methodology that transforms how teams coordinate AI agents for development projects. This lesson introduces the fundamental concepts that make BMAD effective.',
      sections: [
        {
          title: 'What is BMAD?',
          content: `BMAD (Breakthrough Method for Agile AI-Driven Development) is a structured methodology designed specifically for coordinating AI agents in development workflows. Unlike traditional development approaches, BMAD recognizes that AI agents need clear coordination, context preservation, and systematic handoffs to work effectively together.

Key Benefits:
• **Structured Coordination**: Clear phases and agent roles eliminate confusion
• **Context Preservation**: File-based state management ensures continuity
• **Quality Gates**: Built-in quality assurance at each phase
• **Scalability**: Works for solo developers to enterprise teams
• **Transparency**: Visual workflow makes progress clear to all stakeholders`,
          type: 'text'
        },
        {
          title: 'The 5-Phase Workflow',
          content: `BMAD organizes development into 5 distinct phases, each with specific goals and agent responsibilities:

**1. Planning Phase**
- Business analysis and requirement gathering
- Technical architecture design
- Resource planning and timeline estimation
- Risk assessment and mitigation strategies

**2. Story Creation Phase**
- Breaking requirements into development stories
- Prioritizing features and user needs
- Creating detailed acceptance criteria
- Establishing story dependencies

**3. Development Phase**
- Implementing features according to stories
- Code review and peer collaboration
- Integration with existing systems
- Documentation and commenting

**4. Quality Assurance Phase**
- Comprehensive testing (unit, integration, E2E)
- Security vulnerability assessment
- Performance optimization
- User acceptance validation

**5. Complete Phase**
- Final deployment and release preparation
- Documentation finalization
- Project retrospective and lessons learned
- Knowledge transfer and maintenance handoff`,
          type: 'text'
        },
        {
          title: 'Agent Roles in BMAD',
          content: `Each BMAD phase involves specific agent types with clearly defined responsibilities:

**Analyst**: Market research, user needs analysis, competitive analysis
**Architect**: System design, technical architecture, infrastructure planning
**Product Manager**: Feature prioritization, roadmap planning, stakeholder communication
**Product Owner**: User story creation, acceptance criteria, business value definition
**Scrum Master**: Process facilitation, team coordination, impediment removal
**Developer**: Code implementation, technical problem solving, integration
**QA Engineer**: Testing strategy, quality assurance, bug identification
**UX Expert**: User experience design, usability testing, design systems

The **BMAD Orchestrator** coordinates all agents and manages phase transitions.`,
          type: 'text'
        },
        {
          title: 'File-Based Coordination',
          content: `BMAD uses a file-based coordination system that provides several advantages:

**The .bmad/ Directory Structure:**
\`\`\`
project-root/
├── .bmad/
│   ├── state.yaml              # Current project state
│   ├── communications/         # Agent messages
│   │   ├── agent-handoffs/
│   │   ├── status-updates/
│   │   └── blockers/
│   ├── stories/               # Development stories
│   │   ├── active/
│   │   ├── completed/
│   │   └── backlog/
│   └── decisions/             # Architecture decisions
│       ├── technical/
│       └── business/
\`\`\`

**Benefits of File-Based Approach:**
• **Persistence**: State survives application restarts
• **Version Control**: Track changes over time with git
• **Transparency**: All team members can view current state
• **Offline Support**: Work continues without network connectivity
• **Tool Integration**: Any tool can read/write BMAD files`,
          type: 'code'
        }
      ],
      summary: 'BMAD provides a structured, transparent, and scalable approach to AI-driven development through its 5-phase workflow, clear agent roles, and file-based coordination system.',
      keyTakeaways: [
        'BMAD organizes development into 5 clear phases: Planning → Story Creation → Development → QA → Complete',
        'Each phase has specific agent roles with defined responsibilities',
        'File-based coordination ensures persistence, transparency, and tool integration',
        'The methodology scales from individual developers to enterprise teams',
        'Quality gates and systematic handoffs prevent common AI coordination issues'
      ],
      additionalResources: [
        {
          title: 'BMAD Methodology Documentation',
          url: '/docs/bmad-methodology',
          type: 'documentation'
        },
        {
          title: 'Setting Up Your First BMAD Project',
          url: '/docs/project-setup',
          type: 'documentation'
        }
      ]
    },
    exercises: [
      {
        id: 'bmad-fundamentals-quiz',
        title: 'BMAD Fundamentals Knowledge Check',
        type: 'workflow-simulation',
        description: 'Test your understanding of BMAD core concepts',
        instructions: [
          'Answer questions about BMAD phases and agent roles',
          'Identify the correct file structure for BMAD projects',
          'Explain the benefits of file-based coordination'
        ],
        completionCriteria: [
          'Score at least 80% on the knowledge check',
          'Correctly identify all 5 BMAD phases',
          'Understand the role of each agent type'
        ],
        hints: [
          'Remember the 5 phases in order: Planning → Story Creation → Development → QA → Complete',
          'Each agent has specific expertise areas',
          'File-based coordination provides persistence and transparency'
        ],
        estimatedTime: 15,
        difficulty: 'beginner',
        realProjectRequired: false
      }
    ],
    prerequisites: [],
    realProjectIntegration: false,
    estimatedDuration: 30,
    difficulty: 'beginner',
    tags: ['fundamentals', 'methodology', 'overview'],
    order_index: 1
  },

  {
    id: 'project-setup',
    title: 'Project Setup',
    description: 'Learn to create and configure BMAD projects for optimal workflow management',
    phase: 'general',
    content: {
      introduction: 'Setting up a BMAD project correctly is crucial for successful AI-driven development. This lesson covers the project creation wizard, directory structure, and initial configuration.',
      sections: [
        {
          title: 'Using the Project Creator Wizard',
          content: `The BMAD Desktop includes a 5-step project creation wizard that guides you through setup:

**Step 1: Basic Information**
- Project name and description
- Project type (web, mobile, desktop, API, library)
- Technology stack selection

**Step 2: Project Location**
- Choose project directory
- Validate directory structure
- Set up git repository (optional)

**Step 3: Agent Configuration**
- Select initial agents for your project
- Configure agent preferences
- Set up team communication

**Step 4: Project Settings**
- IDE preference selection
- Quality gates configuration
- Notification settings

**Step 5: Review & Create**
- Confirm all settings
- Initialize project structure
- Create initial BMAD files`,
          type: 'interactive'
        },
        {
          title: 'Understanding the .bmad/ Directory',
          content: `Every BMAD project contains a .bmad/ directory that manages coordination:

**Core Files:**
- \`state.yaml\`: Current project state, active phase, and progress
- \`config.yaml\`: Project configuration and preferences
- \`agents.yaml\`: Agent assignments and status

**Communications Directory:**
- \`agent-handoffs/\`: Messages between agents during transitions
- \`status-updates/\`: Regular progress updates
- \`blockers/\`: Issues requiring attention
- \`decisions/\`: Important project decisions

**Stories Directory:**
- \`active/\`: Currently in-progress stories
- \`completed/\`: Finished stories with outcomes
- \`backlog/\`: Planned future stories

**Quality Directory:**
- \`reviews/\`: Code and design reviews
- \`tests/\`: Testing reports and results
- \`security/\`: Security assessments`,
          type: 'code'
        },
        {
          title: 'Initial Configuration',
          content: `After project creation, configure these key settings:

**Quality Gates:**
- Require tests before story completion
- Mandate documentation for new features
- Enforce security reviews for sensitive changes
- Architecture approval for structural changes

**Agent Preferences:**
- Primary IDE for each agent type
- Notification preferences (desktop, email, in-app)
- Working hours and availability
- Communication style preferences

**Integration Settings:**
- Git repository connection
- CI/CD pipeline integration
- Issue tracking system links
- Documentation platform connections`,
          type: 'text'
        }
      ],
      summary: 'Proper BMAD project setup involves using the creation wizard, understanding the .bmad/ directory structure, and configuring quality gates and agent preferences.',
      keyTakeaways: [
        'The 5-step project wizard guides you through complete setup',
        'The .bmad/ directory contains all coordination files and state',
        'Quality gates ensure consistent project standards',
        'Agent preferences optimize workflow for your team',
        'Proper configuration prevents common coordination issues'
      ],
      additionalResources: [
        {
          title: 'Project Setup Video Tutorial',
          url: '/tutorials/project-setup',
          type: 'video'
        },
        {
          title: 'BMAD Configuration Reference',
          url: '/docs/configuration-reference',
          type: 'documentation'
        }
      ]
    },
    exercises: [
      {
        id: 'create-practice-project',
        title: 'Create Your First BMAD Project',
        type: 'project-setup',
        description: 'Use the project creator to set up a practice BMAD project',
        instructions: [
          'Open the BMAD Desktop project creator',
          'Follow the 5-step wizard to create a practice project',
          'Explore the generated .bmad/ directory structure',
          'Modify configuration settings as needed'
        ],
        completionCriteria: [
          'Successfully create a BMAD project',
          'Verify all .bmad/ files are present',
          'Configure at least 3 quality gates',
          'Set up agent preferences'
        ],
        hints: [
          'Choose a simple project type for practice',
          'Enable all quality gates to see the full workflow',
          'Set your preferred IDE in the configuration'
        ],
        estimatedTime: 20,
        difficulty: 'beginner',
        realProjectRequired: true
      }
    ],
    prerequisites: ['bmad-fundamentals'],
    realProjectIntegration: true,
    estimatedDuration: 25,
    difficulty: 'beginner',
    tags: ['setup', 'project-management', 'configuration'],
    order_index: 2
  },

  {
    id: 'agent-coordination',
    title: 'Agent Coordination',
    description: 'Master the art of coordinating AI agents for maximum productivity and quality',
    phase: 'general',
    content: {
      introduction: 'Effective agent coordination is the heart of successful BMAD implementation. Learn how to dispatch agents, manage handoffs, and optimize team productivity.',
      sections: [
        {
          title: 'Understanding Agent Roles',
          content: `Each agent in BMAD has specific expertise and responsibilities:

**Business Intelligence Agents:**
- **Analyst**: Market research, user needs, competitive analysis
- **Product Manager**: Feature prioritization, roadmap, stakeholder communication
- **Product Owner**: User stories, acceptance criteria, business value

**Technical Agents:**
- **Architect**: System design, technical decisions, infrastructure
- **Developer**: Implementation, coding, integration
- **QA Engineer**: Testing, quality assurance, bug identification

**Process Agents:**
- **Scrum Master**: Process facilitation, team coordination
- **UX Expert**: User experience, design, usability

**Coordination:**
- **BMAD Orchestrator**: Phase management, agent dispatch, conflict resolution`,
          type: 'text'
        },
        {
          title: 'Smart Agent Dispatch',
          content: `The BMAD Desktop includes intelligent agent recommendations:

**Recommendation Engine Features:**
- Analyzes current project state and phase
- Considers agent availability and workload
- Factors in story dependencies and prerequisites
- Provides reasoning for each recommendation
- Suggests optimal timing for handoffs

**Manual Override Capabilities:**
- Direct agent assignment when needed
- Custom context and instructions
- Emergency escalation procedures
- Team-specific preferences

**Best Practices:**
- Trust the recommendation engine initially
- Override only when you have specific requirements
- Provide clear context in manual assignments
- Monitor agent effectiveness over time`,
          type: 'text'
        },
        {
          title: 'Managing Agent Handoffs',
          content: `Smooth handoffs between agents are critical for BMAD success:

**Handoff Process:**
1. **Context Preservation**: Current agent documents their work
2. **Knowledge Transfer**: Key decisions and rationale are recorded
3. **Next Steps**: Clear instructions for the receiving agent
4. **Verification**: Receiving agent confirms understanding

**Communication Templates:**
- **Planning → Story Creation**: "Requirements analysis complete, ready for story breakdown"
- **Story Creation → Development**: "Stories prioritized and detailed, development can begin"
- **Development → QA**: "Feature implementation complete, ready for testing"
- **QA → Complete**: "Quality assurance passed, ready for deployment"

**Quality Checkpoints:**
- Validate all deliverables before handoff
- Ensure documentation is complete
- Verify prerequisites are met
- Confirm receiving agent availability`,
          type: 'text'
        }
      ],
      summary: 'Effective agent coordination combines understanding agent roles, using smart dispatch recommendations, and managing seamless handoffs between phases.',
      keyTakeaways: [
        'Each agent type has specific expertise and optimal use cases',
        'The recommendation engine provides intelligent dispatch suggestions',
        'Manual override is available when specific requirements exist',
        'Smooth handoffs require context preservation and clear communication',
        'Quality checkpoints prevent issues from propagating between phases'
      ],
      additionalResources: [
        {
          title: 'Agent Coordination Best Practices',
          url: '/docs/agent-coordination',
          type: 'documentation'
        },
        {
          title: 'Handoff Templates and Examples',
          url: '/templates/handoffs',
          type: 'template'
        }
      ]
    },
    exercises: [
      {
        id: 'practice-agent-dispatch',
        title: 'Practice Agent Dispatch and Handoffs',
        type: 'agent-dispatch',
        description: 'Learn to effectively dispatch agents and manage handoffs',
        instructions: [
          'Use the agent dispatcher to send recommendations',
          'Practice manual agent assignment with custom context',
          'Simulate a complete handoff between two agents',
          'Review and optimize your dispatch decisions'
        ],
        completionCriteria: [
          'Successfully dispatch at least 3 different agent types',
          'Complete a manual override with appropriate context',
          'Execute a handoff with proper documentation',
          'Demonstrate understanding of agent roles'
        ],
        hints: [
          'Start with high-priority recommendations',
          'Use clear, specific language in manual assignments',
          'Include context about project goals and constraints'
        ],
        estimatedTime: 25,
        difficulty: 'intermediate',
        realProjectRequired: true
      }
    ],
    prerequisites: ['bmad-fundamentals', 'project-setup'],
    realProjectIntegration: true,
    estimatedDuration: 40,
    difficulty: 'intermediate',
    tags: ['coordination', 'agents', 'workflow'],
    order_index: 3
  },

  {
    id: 'workflow-management',
    title: 'Workflow Management',
    description: 'Learn to effectively manage BMAD phases, transitions, and story progression',
    phase: 'general',
    content: {
      introduction: 'Workflow management is about orchestrating the 5 BMAD phases efficiently, ensuring smooth transitions, and maintaining project momentum.',
      sections: [
        {
          title: 'Phase Management Strategies',
          content: `Each BMAD phase requires different management approaches:

**Planning Phase Management:**
- Focus on thorough requirement gathering
- Involve all stakeholders early
- Document decisions and rationale
- Set realistic timelines and milestones

**Story Creation Phase:**
- Break down large features into manageable stories
- Prioritize based on business value and dependencies
- Ensure stories have clear acceptance criteria
- Validate stories with stakeholders

**Development Phase:**
- Monitor progress against story completion
- Manage technical debt accumulation
- Facilitate code reviews and collaboration
- Handle scope changes and new requirements

**QA Phase:**
- Coordinate testing activities across all stories
- Manage bug triage and prioritization
- Ensure quality gates are met
- Prepare for deployment

**Complete Phase:**
- Finalize documentation and handoffs
- Conduct retrospectives and lessons learned
- Plan for maintenance and future iterations
- Celebrate achievements and recognize contributions`,
          type: 'text'
        },
        {
          title: 'Story Lifecycle Management',
          content: `Stories are the fundamental unit of work in BMAD:

**Story States:**
- **Backlog**: Identified but not yet started
- **Ready**: Fully specified and prioritized
- **In Progress**: Currently being developed
- **Review**: Under code/design review
- **Testing**: In quality assurance phase
- **Done**: Completed and accepted

**Story Transitions:**
- Clear criteria for moving between states
- Automated notifications for stakeholders
- Dependency tracking and management
- Progress visualization and reporting

**Story Best Practices:**
- Keep stories small and focused (1-3 days of work)
- Include acceptance criteria and definition of done
- Maintain story dependencies and relationships
- Regular story refinement and updates`,
          type: 'text'
        },
        {
          title: 'Handling Workflow Challenges',
          content: `Common workflow challenges and solutions:

**Blocked Stories:**
- Identify root causes quickly
- Escalate to appropriate team members
- Maintain momentum on unblocked work
- Document decisions and resolutions

**Phase Transition Issues:**
- Verify all phase exit criteria are met
- Ensure proper handoff documentation
- Validate receiving team readiness
- Monitor transition effectiveness

**Scope Changes:**
- Assess impact on current phase and timeline
- Communicate changes to all stakeholders
- Update stories and priorities accordingly
- Maintain change history and rationale

**Quality Gate Failures:**
- Identify specific failure points
- Create remediation plans
- Prevent similar issues in future phases
- Learn from failures to improve processes`,
          type: 'text'
        }
      ],
      summary: 'Effective workflow management requires understanding phase-specific strategies, managing story lifecycles, and proactively addressing common challenges.',
      keyTakeaways: [
        'Each BMAD phase requires different management strategies',
        'Stories should be small, well-defined, and properly tracked',
        'Clear transition criteria prevent phase bottlenecks',
        'Proactive issue identification and resolution maintains momentum',
        'Continuous improvement through retrospectives enhances effectiveness'
      ],
      additionalResources: [
        {
          title: 'Workflow Management Patterns',
          url: '/docs/workflow-patterns',
          type: 'documentation'
        },
        {
          title: 'Story Management Templates',
          url: '/templates/stories',
          type: 'template'
        }
      ]
    },
    exercises: [
      {
        id: 'workflow-simulation',
        title: 'Complete Workflow Simulation',
        type: 'workflow-simulation',
        description: 'Simulate a complete BMAD workflow from planning to completion',
        instructions: [
          'Start a new workflow in the planning phase',
          'Progress through each phase with appropriate activities',
          'Handle at least one blocker or challenge',
          'Complete the workflow with proper documentation'
        ],
        completionCriteria: [
          'Successfully transition through all 5 phases',
          'Demonstrate proper story management',
          'Handle a workflow challenge effectively',
          'Complete with appropriate documentation'
        ],
        hints: [
          'Focus on meeting phase exit criteria',
          'Use the phase indicators to track progress',
          'Document decisions and rationale clearly'
        ],
        estimatedTime: 35,
        difficulty: 'intermediate',
        realProjectRequired: true
      }
    ],
    prerequisites: ['bmad-fundamentals', 'project-setup', 'agent-coordination'],
    realProjectIntegration: true,
    estimatedDuration: 45,
    difficulty: 'intermediate',
    tags: ['workflow', 'phases', 'management'],
    order_index: 4
  },

  {
    id: 'communication-best-practices',
    title: 'Communication Best Practices',
    description: 'Master effective communication patterns for AI agent coordination and team collaboration',
    phase: 'general',
    content: {
      introduction: 'Effective communication is essential for successful BMAD implementation. Learn how to facilitate clear agent communication, manage team updates, and maintain project transparency.',
      sections: [
        {
          title: 'Agent Communication Patterns',
          content: `BMAD uses structured communication patterns to ensure clarity:

**Message Types:**
- **Handoff**: Formal transfer of work between agents
- **Question**: Request for information or clarification
- **Update**: Progress report or status change
- **Completion**: Notification of finished work
- **BlockerReport**: Issue that prevents progress
- **ContextShare**: Background information sharing

**Communication Templates:**
- Structured format ensures consistency
- Required fields prevent missing information
- Clear subject lines and priorities
- Proper escalation paths

**Best Practices:**
- Be specific and actionable in requests
- Include relevant context and constraints
- Set clear expectations and deadlines
- Follow up on important communications`,
          type: 'text'
        },
        {
          title: 'Managing the Communication Board',
          content: `The communication board is the central hub for team coordination:

**Message Organization:**
- Filter by agent, type, or status
- Search functionality for finding specific communications
- Thread conversations for related discussions
- Archive completed communications

**Real-time Updates:**
- Automatic notifications for new messages
- Status indicators for message processing
- Integration with desktop notifications
- Mobile-friendly interface for remote access

**Communication Hygiene:**
- Regular cleanup of completed threads
- Clear and descriptive message subjects
- Appropriate use of message types
- Timely responses to questions and requests`,
          type: 'text'
        },
        {
          title: 'Team Collaboration Techniques',
          content: `Effective team collaboration in BMAD environments:

**Daily Standups:**
- Review communication board highlights
- Identify blockers and dependencies
- Coordinate upcoming handoffs
- Share lessons learned and improvements

**Phase Retrospectives:**
- Analyze communication effectiveness
- Identify process improvements
- Celebrate successful collaborations
- Address team concerns and suggestions

**Documentation Standards:**
- Decision records for important choices
- Architecture decision records (ADRs)
- Meeting notes and action items
- Knowledge sharing and best practices`,
          type: 'text'
        }
      ],
      summary: 'Effective BMAD communication combines structured message patterns, organized communication boards, and strong team collaboration practices.',
      keyTakeaways: [
        'Structured message types ensure clear communication',
        'The communication board provides centralized coordination',
        'Regular cleanup and organization maintains effectiveness',
        'Team practices like standups and retrospectives enhance collaboration',
        'Good documentation supports long-term project success'
      ],
      additionalResources: [
        {
          title: 'Communication Templates Library',
          url: '/templates/communication',
          type: 'template'
        },
        {
          title: 'Team Collaboration Guide',
          url: '/docs/team-collaboration',
          type: 'documentation'
        }
      ]
    },
    exercises: [
      {
        id: 'communication-practice',
        title: 'Practice Effective Communication',
        type: 'communication',
        description: 'Learn to create clear, effective communications in BMAD projects',
        instructions: [
          'Send different types of messages using the communication board',
          'Practice writing clear handoff communications',
          'Manage a conversation thread effectively',
          'Organize and filter the communication board'
        ],
        completionCriteria: [
          'Send examples of all 6 message types',
          'Write a comprehensive handoff message',
          'Successfully manage a multi-message conversation',
          'Demonstrate board organization skills'
        ],
        hints: [
          'Use templates as starting points for messages',
          'Include all necessary context in handoff messages',
          'Keep conversations focused and actionable'
        ],
        estimatedTime: 30,
        difficulty: 'intermediate',
        realProjectRequired: true
      }
    ],
    prerequisites: ['bmad-fundamentals', 'project-setup', 'agent-coordination'],
    realProjectIntegration: true,
    estimatedDuration: 35,
    difficulty: 'intermediate',
    tags: ['communication', 'collaboration', 'team'],
    order_index: 5
  },

  {
    id: 'quality-gates',
    title: 'Quality Gates',
    description: 'Implement effective quality assurance workflows and standards in BMAD projects',
    phase: BMadPhase.QualityAssurance,
    content: {
      introduction: 'Quality gates ensure that work meets standards before progressing to the next phase. Learn to implement, manage, and optimize quality assurance in BMAD workflows.',
      sections: [
        {
          title: 'Understanding Quality Gates',
          content: `Quality gates are checkpoints that ensure work meets defined standards:

**Types of Quality Gates:**
- **Code Quality**: Static analysis, code review, style compliance
- **Testing**: Unit tests, integration tests, end-to-end tests
- **Security**: Vulnerability scanning, security review, compliance
- **Documentation**: API docs, user guides, technical specifications
- **Performance**: Load testing, performance benchmarks, optimization
- **Accessibility**: WCAG compliance, screen reader testing, usability

**Gate Configuration:**
- Required vs. optional gates
- Automatic vs. manual verification
- Gate failure handling and remediation
- Escalation paths and approval workflows

**Best Practices:**
- Implement gates early in the project
- Make criteria clear and measurable
- Automate verification where possible
- Provide quick feedback on failures`,
          type: 'text'
        },
        {
          title: 'Implementing Testing Strategies',
          content: `Comprehensive testing is crucial for BMAD quality:

**Testing Pyramid:**
- **Unit Tests (70%)**: Fast, focused, developer-written
- **Integration Tests (20%)**: Component interaction testing
- **End-to-End Tests (10%)**: Full user journey validation

**Testing Types by Phase:**
- **Development Phase**: Unit tests, component tests
- **QA Phase**: Integration, E2E, performance, security
- **Complete Phase**: User acceptance, deployment verification

**Automated Testing:**
- Continuous integration pipeline integration
- Automated test execution on code changes
- Test result reporting and analysis
- Flaky test identification and resolution

**Manual Testing:**
- Exploratory testing for edge cases
- Usability testing with real users
- Accessibility testing with assistive technologies
- Cross-browser and cross-platform testing`,
          type: 'text'
        },
        {
          title: 'Quality Metrics and Monitoring',
          content: `Track quality metrics to ensure continuous improvement:

**Code Quality Metrics:**
- Code coverage percentage
- Cyclomatic complexity scores
- Technical debt accumulation
- Code review approval rates

**Testing Metrics:**
- Test execution success rates
- Bug discovery and resolution times
- Test automation coverage
- Performance benchmark trends

**Process Metrics:**
- Gate success rates by type
- Average gate resolution time
- Escalation frequency and reasons
- Quality improvement trends

**Reporting and Dashboards:**
- Real-time quality status displays
- Historical trend analysis
- Team performance comparisons
- Stakeholder communication reports`,
          type: 'text'
        }
      ],
      summary: 'Effective quality gates combine clear standards, comprehensive testing strategies, and continuous monitoring to ensure high-quality deliverables.',
      keyTakeaways: [
        'Quality gates provide essential checkpoints for maintaining standards',
        'The testing pyramid ensures efficient and comprehensive coverage',
        'Automation accelerates feedback and reduces manual effort',
        'Metrics and monitoring enable continuous quality improvement',
        'Clear criteria and processes prevent quality gate bottlenecks'
      ],
      additionalResources: [
        {
          title: 'Quality Gate Configuration Guide',
          url: '/docs/quality-gates',
          type: 'documentation'
        },
        {
          title: 'Testing Strategy Templates',
          url: '/templates/testing',
          type: 'template'
        }
      ]
    },
    exercises: [
      {
        id: 'quality-gate-setup',
        title: 'Configure Quality Gates',
        type: 'quality-gates',
        description: 'Set up and test quality gates for a BMAD project',
        instructions: [
          'Configure different types of quality gates',
          'Test gate failure and remediation processes',
          'Set up automated quality checks',
          'Monitor quality metrics and reports'
        ],
        completionCriteria: [
          'Successfully configure at least 4 different gate types',
          'Demonstrate gate failure handling',
          'Set up at least one automated check',
          'Generate and interpret quality reports'
        ],
        hints: [
          'Start with simple gates like code formatting',
          'Test failure scenarios to understand remediation',
          'Use existing tools for automation when possible'
        ],
        estimatedTime: 40,
        difficulty: 'advanced',
        realProjectRequired: true
      }
    ],
    prerequisites: ['bmad-fundamentals', 'project-setup', 'workflow-management'],
    realProjectIntegration: true,
    estimatedDuration: 45,
    difficulty: 'advanced',
    tags: ['quality', 'testing', 'standards'],
    order_index: 6
  },

  {
    id: 'advanced-techniques',
    title: 'Advanced Techniques',
    description: 'Master advanced BMAD patterns for complex projects and team scenarios',
    phase: 'general',
    content: {
      introduction: 'Advanced BMAD techniques help you handle complex projects, large teams, and challenging scenarios that require sophisticated coordination strategies.',
      sections: [
        {
          title: 'Complex Project Coordination',
          content: `Advanced patterns for managing large-scale BMAD projects:

**Multi-Team Coordination:**
- Shared communication boards across teams
- Cross-team dependency management
- Synchronized release planning
- Conflict resolution protocols

**Parallel Workflow Management:**
- Multiple concurrent development streams
- Feature branch coordination
- Integration planning and execution
- Risk management for parallel work

**Scaling Strategies:**
- Team topology optimization
- Communication flow design
- Responsibility matrix definition
- Decision-making authority levels

**Enterprise Integration:**
- Corporate tool integration
- Compliance and governance requirements
- Reporting and audit trails
- Change management processes`,
          type: 'text'
        },
        {
          title: 'Advanced Agent Patterns',
          content: `Sophisticated agent coordination techniques:

**Agent Specialization:**
- Domain-specific agent configurations
- Skill-based agent assignment
- Performance-based agent selection
- Agent training and improvement

**Dynamic Agent Allocation:**
- Workload-based agent distribution
- Real-time agent rebalancing
- Emergency agent reassignment
- Agent capacity planning

**AI Agent Integration:**
- LLM model selection for different tasks
- Context window optimization
- Multi-model coordination strategies
- Cost optimization techniques

**Human-AI Collaboration:**
- Human oversight and intervention points
- Escalation triggers and protocols
- Expertise augmentation strategies
- Knowledge transfer mechanisms`,
          type: 'text'
        },
        {
          title: 'Optimization and Performance',
          content: `Techniques for optimizing BMAD workflow performance:

**Workflow Optimization:**
- Bottleneck identification and resolution
- Phase parallelization opportunities
- Handoff optimization strategies
- Automation potential assessment

**Communication Optimization:**
- Message flow analysis and improvement
- Notification optimization
- Information architecture refinement
- Feedback loop enhancement

**Quality Optimization:**
- Risk-based testing strategies
- Continuous improvement processes
- Metric-driven optimization
- Predictive quality analytics

**Resource Optimization:**
- Agent utilization analysis
- Tool and infrastructure optimization
- Cost-benefit analysis for improvements
- ROI measurement and tracking`,
          type: 'text'
        }
      ],
      summary: 'Advanced BMAD techniques enable sophisticated project coordination, agent management, and workflow optimization for complex scenarios.',
      keyTakeaways: [
        'Multi-team coordination requires shared infrastructure and protocols',
        'Advanced agent patterns enable sophisticated AI-human collaboration',
        'Optimization techniques improve workflow efficiency and quality',
        'Enterprise integration considerations ensure scalability',
        'Continuous improvement drives long-term success'
      ],
      additionalResources: [
        {
          title: 'Advanced BMAD Patterns',
          url: '/docs/advanced-patterns',
          type: 'documentation'
        },
        {
          title: 'Enterprise BMAD Implementation Guide',
          url: '/docs/enterprise-implementation',
          type: 'documentation'
        }
      ]
    },
    exercises: [
      {
        id: 'advanced-scenario',
        title: 'Handle Complex Project Scenario',
        type: 'workflow-simulation',
        description: 'Manage a complex BMAD project with multiple challenges',
        instructions: [
          'Set up a multi-team project scenario',
          'Handle parallel development streams',
          'Resolve cross-team dependencies',
          'Optimize workflow performance'
        ],
        completionCriteria: [
          'Successfully coordinate multiple teams',
          'Manage parallel development effectively',
          'Resolve at least one cross-team conflict',
          'Demonstrate measurable performance improvement'
        ],
        hints: [
          'Use clear communication protocols for multi-team coordination',
          'Identify and address bottlenecks early',
          'Focus on automation for repetitive tasks'
        ],
        estimatedTime: 60,
        difficulty: 'expert',
        realProjectRequired: true
      }
    ],
    prerequisites: ['bmad-fundamentals', 'project-setup', 'agent-coordination', 'workflow-management', 'communication-best-practices', 'quality-gates'],
    realProjectIntegration: true,
    estimatedDuration: 60,
    difficulty: 'expert',
    tags: ['advanced', 'coordination', 'optimization'],
    order_index: 7
  }
];

/**
 * Get lesson by ID
 */
export const getBMadLessonById = (id: string): BMadLesson | undefined => {
  return BMAD_CORE_LESSONS.find(lesson => lesson.id === id);
};

/**
 * Get lessons by difficulty level
 */
export const getBMadLessonsByDifficulty = (difficulty: string): BMadLesson[] => {
  return BMAD_CORE_LESSONS.filter(lesson => lesson.difficulty === difficulty);
};

/**
 * Get lessons by phase
 */
export const getBMadLessonsByPhase = (phase: BMadPhase | 'general'): BMadLesson[] => {
  return BMAD_CORE_LESSONS.filter(lesson => lesson.phase === phase);
};

/**
 * Get recommended lesson progression for beginners
 */
export const getBeginnerLessonProgression = (): BMadLesson[] => {
  return BMAD_CORE_LESSONS.filter(lesson => 
    ['beginner', 'intermediate'].includes(lesson.difficulty)
  ).sort((a, b) => a.order_index - b.order_index);
};

/**
 * Calculate total estimated learning time
 */
export const getTotalEstimatedTime = (lessons: BMadLesson[]): number => {
  return lessons.reduce((total, lesson) => total + lesson.estimatedDuration, 0);
};