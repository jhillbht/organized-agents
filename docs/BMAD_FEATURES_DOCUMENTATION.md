# BMAD Desktop Features Documentation

## Table of Contents

1. [Dashboard Features](#dashboard-features)
2. [Project Management](#project-management)
3. [Workflow Manager](#workflow-manager)
4. [Agent Dispatch Center](#agent-dispatch-center)
5. [Communication Board](#communication-board)
6. [Education System](#education-system)
7. [Quality Gates](#quality-gates)
8. [IDE Integration](#ide-integration)
9. [Real-time Updates](#real-time-updates)
10. [Analytics & Reporting](#analytics--reporting)

## Dashboard Features

### Main Dashboard

The BMAD Desktop dashboard provides a comprehensive overview of all your projects and activities.

#### Key Components

**Project Grid**
- Visual cards for each BMAD project
- Real-time status indicators
- Progress bars showing completion
- Quick action buttons
- Last activity timestamps

**Quick Actions Panel**
- Create New Project button
- Access Education resources
- View recent notifications
- System health indicators

**Activity Feed**
- Real-time updates from all projects
- Agent communications
- Phase transitions
- Important notifications

#### Features

- **Responsive Design**: Adapts to different screen sizes
- **Dark/Light Mode**: Toggle between themes
- **Customizable Layout**: Arrange panels to your preference
- **Keyboard Shortcuts**: Quick navigation with hotkeys
- **Search Functionality**: Find projects and messages quickly

### Project Cards

Each project card displays:
- Project name and description
- Current phase with visual indicator
- Progress percentage
- Active agents count
- Last update timestamp
- Quick access buttons (View, Edit, Archive)

## Project Management

### Project Creator Wizard

A comprehensive 5-step wizard for creating new BMAD projects.

#### Step 1: Basic Information
- **Project Name**: With validation for uniqueness
- **Description**: Rich text editor for detailed descriptions
- **Project Type**: 
  - Web Application
  - Mobile Application
  - Desktop Application
  - API/Backend Service
  - Library/Package
- **Tags**: Custom tags for organization

#### Step 2: Project Location
- **Directory Selection**: Visual file browser
- **Path Validation**: Ensures valid directory structure
- **Git Integration**: Optional repository initialization
- **Directory Creation**: Auto-create if doesn't exist

#### Step 3: Agent Configuration
- **Agent Selection**: Choose which agents to activate
- **Role Assignment**: Assign primary responsibilities
- **Availability Settings**: Set agent working hours
- **Communication Preferences**: Email, desktop, in-app

#### Step 4: Project Settings
- **IDE Preferences**: Select preferred development environment
- **Quality Gates**: Configure quality checkpoints
- **Notification Settings**: Choose notification channels
- **Integration Options**: Connect external tools

#### Step 5: Review & Create
- **Configuration Summary**: Review all settings
- **Validation Checks**: Ensure all requirements met
- **Template Selection**: Optional project templates
- **Creation Process**: Visual progress indicator

### Project Settings

Comprehensive project configuration options:

**General Settings**
- Project name and description
- Project type and tags
- Creation date and owner
- Archive/restore functionality

**Team Settings**
- Agent assignments
- Role definitions
- Permission levels
- Collaboration rules

**Quality Settings**
- Gate configurations
- Testing requirements
- Code standards
- Documentation rules

**Integration Settings**
- Version control
- CI/CD pipelines
- Issue tracking
- Documentation platforms

## Workflow Manager

### Visual Workflow Display

The workflow manager provides a visual representation of your project's progress through BMAD phases.

#### Phase Indicators

**Interactive Timeline**
- Visual representation of all 5 phases
- Current phase highlighted
- Progress indicators for each phase
- Estimated completion times

**Phase Cards**
- Detailed view of each phase
- Active tasks and agents
- Quality gate status
- Key metrics

#### Features

- **Drag-and-Drop**: Reorder stories and tasks
- **Phase Transitions**: Visual transition animations
- **Progress Tracking**: Real-time progress updates
- **Dependency Visualization**: See task relationships
- **Milestone Markers**: Important checkpoints

### Story Management

**Story Board**
- Kanban-style board view
- Columns for story states
- Drag-and-drop functionality
- Quick edit capabilities

**Story Details**
- Title and description
- Acceptance criteria
- Assigned agents
- Status and progress
- Comments and attachments

**Filtering Options**
- By phase
- By agent
- By priority
- By status
- By tags

## Agent Dispatch Center

### Intelligent Recommendations

The dispatch center uses AI to recommend optimal agent assignments.

#### Recommendation Engine

**Factors Considered**
- Current project phase
- Agent availability
- Task dependencies
- Agent expertise
- Historical performance
- Current workload

**Priority Scoring**
- 1-10 priority scale
- Color-coded indicators
- Reasoning explanations
- Time estimates

#### Features

- **Smart Dispatch**: One-click agent assignment
- **Bulk Operations**: Dispatch multiple agents
- **Manual Override**: Direct agent assignment
- **IDE Launch**: Open project in agent's preferred IDE
- **Context Sharing**: Automatic context transfer

### Agent Management

**Agent Status Display**
- Active/Idle/Blocked status
- Current task assignment
- Performance metrics
- Communication history

**Agent Cards**
- Avatar and name
- Current status
- Expertise areas
- Recent activities
- Quick actions

## Communication Board

### Message Management

Centralized communication hub for all project-related messages.

#### Message Types

**Handoff Messages**
- Work transfer between agents
- Context preservation
- Required fields validation
- Acknowledgment tracking

**Status Updates**
- Progress reports
- Milestone achievements
- Blocker notifications
- General updates

**Questions & Clarifications**
- Threaded discussions
- Mention functionality
- Priority levels
- Response tracking

#### Features

- **Real-time Updates**: Live message streaming
- **Rich Text Editor**: Markdown support
- **File Attachments**: Drag-and-drop files
- **Search & Filter**: Find messages quickly
- **Export Options**: Download communication logs

### Communication Analytics

- Message volume trends
- Response time metrics
- Agent communication patterns
- Bottleneck identification

## Education System

### Integrated Learning Platform

Comprehensive education system for mastering BMAD methodology.

#### Learning Dashboard

**Three-Tab Interface**
1. **Overview Tab**
   - Quick stats and progress
   - Skill development tracking
   - Recent achievements
   - Recommended next steps

2. **BMAD Learning Tab**
   - 7 core methodology lessons
   - Interactive exercises
   - Progress tracking
   - Prerequisites management

3. **Academy Portal Tab**
   - External lovable.dev integration
   - Advanced courses
   - Certifications
   - Community access

#### Features

**Interactive Tutorials**
- Step-by-step guidance
- Code snippets and examples
- Progress checkpoints
- Hint system

**Project-Based Learning**
- Use real projects for learning
- Context-aware exercises
- Immediate application
- Performance tracking

**Smart Recommendations**
- Contextual learning suggestions
- Skill gap analysis
- Personalized learning paths
- Just-in-time tips

### Achievement System

**Achievement Types**
- Methodology mastery
- Project milestones
- Collaboration excellence
- Learning streaks

**Gamification Elements**
- Points and badges
- Leaderboards
- Skill levels
- Progress streaks

## Quality Gates

### Gate Configuration

Flexible quality gate system ensuring project standards.

#### Gate Types

**Code Quality**
- Static analysis integration
- Code coverage requirements
- Complexity thresholds
- Style compliance

**Testing Gates**
- Unit test requirements
- Integration test coverage
- E2E test suites
- Performance benchmarks

**Security Gates**
- Vulnerability scanning
- Dependency checking
- Code review requirements
- Compliance validation

**Documentation Gates**
- API documentation
- User guides
- Technical specs
- Inline comments

#### Features

- **Customizable Rules**: Define your own gates
- **Automated Checks**: Integration with CI/CD
- **Manual Overrides**: With justification
- **Reporting**: Detailed gate reports
- **Remediation Guidance**: How to fix failures

## IDE Integration

### Supported IDEs

**Direct Integration**
- Visual Studio Code
- IntelliJ IDEA
- WebStorm
- PyCharm
- Sublime Text

**Features**
- One-click project opening
- Context preservation
- Agent-specific configurations
- File synchronization
- Terminal integration

### Context Sharing

**Automatic Context Transfer**
- Current story details
- Related files
- Agent instructions
- Project state

**IDE Extensions**
- BMAD status bar
- Quick commands
- Agent communication
- Phase indicators

## Real-time Updates

### Live Synchronization

**WebSocket Connection**
- Real-time message delivery
- Instant status updates
- Live progress tracking
- Collaborative editing

**Offline Support**
- Queue operations
- Sync on reconnect
- Conflict resolution
- Local state preservation

### Notification System

**Multi-channel Notifications**
- Desktop notifications
- In-app alerts
- Email summaries
- Mobile push (coming soon)

**Notification Controls**
- Granular preferences
- Do not disturb mode
- Priority filtering
- Batch settings

## Analytics & Reporting

### Project Analytics

**Key Metrics**
- Phase duration tracking
- Story completion rates
- Agent productivity
- Quality metrics
- Communication patterns

**Visualizations**
- Progress charts
- Burndown graphs
- Agent utilization
- Quality trends
- Timeline views

### Reporting Features

**Report Types**
- Executive summaries
- Detailed phase reports
- Agent performance
- Quality assessments
- Communication logs

**Export Options**
- PDF generation
- CSV data export
- API access
- Scheduled reports
- Custom templates

### Dashboard Customization

**Widget System**
- Drag-and-drop widgets
- Custom metrics
- Real-time updates
- Multiple dashboards
- Sharing options

---

## Feature Comparison Matrix

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Projects | 3 | Unlimited | Unlimited |
| Agents | All | All | All + Custom |
| Education | Core | Full | Full + Custom |
| IDE Integration | 3 IDEs | All | All + Custom |
| Quality Gates | Standard | Customizable | Fully Custom |
| Analytics | Basic | Advanced | Enterprise |
| Support | Community | Priority | Dedicated |

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Project | Ctrl+N | Cmd+N |
| Open Project | Ctrl+O | Cmd+O |
| Agent Dispatch | Ctrl+D | Cmd+D |
| Communication | Ctrl+M | Cmd+M |
| Search | Ctrl+F | Cmd+F |
| Settings | Ctrl+, | Cmd+, |
| Help | F1 | F1 |

---

## API Integration

BMAD Desktop provides a comprehensive API for custom integrations:

```typescript
// Example: Creating a project via API
const project = await BMadAPI.createProject({
  name: "My Project",
  type: "web_app",
  description: "E-commerce platform",
  agents: ["developer", "qa_engineer"]
});

// Example: Dispatching an agent
await BMadAPI.dispatchAgent(
  project.id,
  AgentType.Developer,
  "Implement user authentication"
);

// Example: Getting project analytics
const analytics = await BMadAPI.getProjectAnalytics(project.id);
console.log(analytics.phaseMetrics);
```

For complete API documentation, see the [API Reference](/api-docs).

---

## Configuration Files

BMAD Desktop uses YAML configuration files for maximum flexibility:

```yaml
# .bmad/config.yaml
project:
  name: "E-commerce Platform"
  type: "web_app"
  version: "1.0.0"

quality_gates:
  code_coverage:
    threshold: 80
    required: true
  
  security_scan:
    provider: "snyk"
    fail_on: "high"

integrations:
  github:
    enabled: true
    auto_pr: true
  
  slack:
    webhook: "https://..."
    channels:
      updates: "#project-updates"
      alerts: "#project-alerts"
```

---

## Coming Soon

**Planned Features**
- Mobile companion app
- Voice commands
- AI code generation
- Advanced analytics AI
- Team collaboration spaces
- Plugin marketplace

**Beta Features**
- Custom agent creation
- Workflow templates
- Advanced automation
- Cross-project analytics

---

For more detailed information about specific features, consult the relevant section in the [User Manual](/docs/user-manual) or contact our support team.