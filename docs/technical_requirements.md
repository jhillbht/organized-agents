# BMAD Desktop v1.0: Technical Requirements

## System Architecture Requirements

### **Application Framework**
- **Primary:** Tauri 2.x (Rust backend + React frontend)
- **Backend Runtime:** Rust with Tokio async runtime
- **Frontend Framework:** React 18+ with TypeScript
- **Build System:** Vite for frontend, Cargo for backend
- **Target Platforms:** Windows 10+, macOS 11+, Ubuntu 20.04+

### **Core Dependencies**

#### **Rust Dependencies (Cargo.toml)**
```toml
[dependencies]
# Core Tauri
tauri = { version = "2.0", features = ["shell-open"] }
tauri-plugin-fs = "2.0"
tauri-plugin-dialog = "2.0"

# BMAD Integration
serde = { version = "1.0", features = ["derive"] }
serde_yaml = "0.9"                    # YAML parsing for state files
serde_json = "1.0"                    # JSON for communication
notify = "6.0"                        # File system watching
walkdir = "2.0"                       # Directory traversal
tokio = { version = "1.0", features = ["full"] }

# Utilities
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1.0", features = ["v4", "serde"] }
thiserror = "1.0"                     # Error handling
anyhow = "1.0"                        # Error context
tracing = "0.1"                       # Logging
tracing-subscriber = "0.3"

# Removed dependencies (for reference)
# mcp-protocol = "0.1"                # Remove MCP support
# sandbox-isolation = "0.2"           # Remove sandbox system
# process-management = "0.1"          # Remove process registry
```

#### **React Dependencies (package.json)**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-fs": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.263.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  }
}
```

---

## Data Structure Specifications

### **Core BMAD Types**

```rust
// src-tauri/src/bmad/types.rs
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BMadProject {
    pub id: Uuid,
    pub name: String,
    pub path: PathBuf,
    pub state: ProjectState,
    pub communications: Vec<AgentMessage>,
    pub created_at: DateTime<Utc>,
    pub last_modified: DateTime<Utc>,
    pub settings: ProjectSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectState {
    pub bmad_version: String,
    pub project_state: ProjectStateType,
    pub current_phase: BMadPhase,
    pub active_story: Option<String>,
    pub next_actions: Vec<NextAction>,
    pub workflow_history: Vec<WorkflowEvent>,
    pub agents: AgentStatuses,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BMadPhase {
    Planning,
    StoryCreation,
    Development,
    QualityAssurance,
    Complete,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectStateType {
    Initializing,
    Planning,
    Development,
    QualityAssurance,
    Complete,
    OnHold,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessage {
    pub id: Uuid,
    pub from_agent: AgentType,
    pub to_agent: Option<AgentType>,
    pub content: String,
    pub message_type: MessageType,
    pub files_referenced: Vec<PathBuf>,
    pub timestamp: DateTime<Utc>,
    pub status: MessageStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentType {
    Analyst,
    Architect,
    ProductManager,
    ProductOwner,
    ScrumMaster,
    Developer,
    QualityAssurance,
    UXExpert,
    BMadOrchestrator,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    Handoff,
    Question,
    Update,
    Completion,
    BlockerReport,
    ContextShare,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NextAction {
    pub agent: AgentType,
    pub task: String,
    pub story: Option<String>,
    pub estimated_time: Option<String>,
    pub dependencies: Vec<String>,
    pub auto_trigger: bool,
}
```

### **Frontend TypeScript Types**

```typescript
// src/types/bmad.ts
export interface BMadProject {
  id: string;
  name: string;
  path: string;
  state: ProjectState;
  communications: AgentMessage[];
  createdAt: string;
  lastModified: string;
  settings: ProjectSettings;
}

export interface ProjectState {
  bmadVersion: string;
  projectState: ProjectStateType;
  currentPhase: BMadPhase;
  activeStory?: string;
  nextActions: NextAction[];
  workflowHistory: WorkflowEvent[];
  agents: AgentStatuses;
}

export enum BMadPhase {
  Planning = 'Planning',
  StoryCreation = 'StoryCreation', 
  Development = 'Development',
  QualityAssurance = 'QualityAssurance',
  Complete = 'Complete',
}

export interface AgentMessage {
  id: string;
  fromAgent: AgentType;
  toAgent?: AgentType;
  content: string;
  messageType: MessageType;
  filesReferenced: string[];
  timestamp: string;
  status: MessageStatus;
}

export interface WorkflowEvent {
  id: string;
  eventType: WorkflowEventType;
  agent: AgentType;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}
```

---

## File System Requirements

### **BMAD Project Structure**

```
project-root/
├── .bmad/                           # BMAD coordination directory
│   ├── state.yaml                   # Project workflow state
│   ├── session.yaml                 # Session continuity data
│   ├── communications/              # Agent message files
│   │   ├── sm-to-dev.md            # Scrum Master to Developer
│   │   ├── architect-to-sm.md       # Architect to Scrum Master
│   │   ├── qa-to-dev.md            # QA to Developer
│   │   └── dev-status.md           # Developer status updates
│   ├── context/                     # Shared knowledge
│   │   ├── decisions.md            # Architecture decisions
│   │   ├── patterns.md             # Code patterns discovered
│   │   ├── learnings.md            # Project learnings
│   │   └── blockers.md             # Current impediments
│   └── logs/                        # Activity logs
│       ├── workflow.log            # Workflow events
│       ├── agent-activity.log      # Agent interactions
│       └── file-changes.log        # File system changes
├── bmad-agent/                      # BMAD methodology files
│   ├── personas/                    # Agent definitions
│   ├── templates/                   # Document templates
│   ├── workflows/                   # Workflow definitions
│   └── checklists/                  # Quality checklists
├── docs/                           # Project documentation
│   ├── prd.md                      # Product requirements
│   ├── architecture.md             # Technical architecture
│   ├── api-spec.md                 # API specifications
│   └── stories/                    # Development stories
│       ├── user-auth-story.md
│       ├── payment-integration.md
│       └── admin-dashboard.md
└── src/                            # Source code
    └── [project files]
```

### **File Format Specifications**

#### **State File (.bmad/state.yaml)**
```yaml
bmad_version: "1.0.0"
project_state: "development"
current_phase: "story_execution"
active_story: "user-authentication-api"

phases:
  planning:
    status: "complete"
    artifacts: ["docs/prd.md", "docs/architecture.md"]
    completed_at: "2025-01-15T10:30:00Z"
  
  story_creation:
    status: "complete"
    stories_created: 8
    stories_ready: 5
    completed_at: "2025-01-15T12:00:00Z"
  
  story_execution:
    status: "in_progress"
    current_story: "user-authentication-api"
    assigned_agent: "dev"
    started_at: "2025-01-15T14:00:00Z"

next_actions:
  - agent: "dev"
    task: "implement_story"
    story: "user-authentication-api"
    estimated_time: "2h"
  
  - agent: "qa"
    task: "review_implementation"
    depends_on: "user-authentication-api"
    auto_trigger: true

agents:
  dev:
    status: "active"
    current_task: "implementing JWT authentication"
    last_activity: "2025-01-15T14:30:00Z"
  qa:
    status: "waiting"
    queue_position: 1
    estimated_start: "2025-01-15T16:00:00Z"
```

#### **Communication File (.bmad/communications/sm-to-dev.md)**
```markdown
# SM → Dev Communication

## Story Ready: User Authentication API ✅

**Last Updated:** 2025-01-15 14:30 UTC  
**Status:** Ready for Implementation  

### Context
- User authentication story has been fully defined
- Architecture requirements documented in `docs/architecture.md#security`
- Database schema finalized and migration ready

### Implementation Details
- **Primary Task:** Implement `/api/auth/login` endpoint
- **Technology:** Use JWT tokens as specified in architecture
- **Testing:** Reference existing auth tests in `tests/auth.test.js`
- **Security:** Follow OWASP guidelines in architecture doc

### Dependencies Met
- [x] Database schema migration complete
- [x] JWT library installed and configured  
- [x] Environment variables set up
- [x] Security review of approach completed

### Next Steps for Dev Agent
1. Begin implementation of login endpoint
2. Implement JWT token generation and validation
3. Add proper error handling and validation
4. Write unit tests for authentication logic
5. Update API documentation

### Files to Reference
- `docs/architecture.md` - Security section
- `docs/stories/user-auth-story.md` - Full requirements
- `src/config/auth.js` - Authentication configuration
- `tests/auth.test.js` - Existing test patterns

### Questions/Blockers
None at this time. All dependencies resolved.

### Handoff Instructions
**To QA Agent:** Run test suite with `npm test auth`, perform manual security testing, validate JWT implementation against security requirements.

---
*Generated by SM Agent - Auto-trigger QA when story marked complete*
```

---

## Component Architecture Requirements

### **React Component Structure**

```typescript
// Main Application Layout
src/components/
├── App.tsx                          # Main application component
├── Layout/
│   ├── Topbar.tsx                  # Keep existing
│   ├── Sidebar.tsx                 # Adapt for BMAD
│   └── MainContent.tsx             # New main content area
├── BMAD/
│   ├── WorkflowDisplay/
│   │   ├── index.tsx               # Main workflow component
│   │   ├── PhaseIndicator.tsx      # Phase progress display
│   │   ├── StoryStatus.tsx         # Active story information
│   │   └── AgentQueue.tsx          # Agent status and queue
│   ├── CommunicationBoard/
│   │   ├── index.tsx               # Message board component
│   │   ├── MessageList.tsx         # Message display
│   │   ├── MessageComposer.tsx     # Message composition
│   │   └── FileLinks.tsx           # File reference handling
│   ├── ProjectManager/
│   │   ├── index.tsx               # Project management
│   │   ├── ProjectList.tsx         # Project listing
│   │   ├── ProjectCreator.tsx      # New project wizard
│   │   └── ProjectSettings.tsx     # Project configuration
│   └── AgentDispatcher/
│       ├── index.tsx               # Agent dispatch interface
│       ├── AgentSelector.tsx       # Agent selection UI
│       ├── ContextDisplay.tsx      # Context information
│       └── ActionButtons.tsx       # Dispatch actions
├── Academy/                        # Keep existing education system
└── ui/                            # Keep existing UI components
```

### **Component Interface Requirements**

```typescript
// src/components/BMAD/WorkflowDisplay/index.tsx
interface WorkflowDisplayProps {
  project: BMadProject;
  onPhaseChange: (phase: BMadPhase) => void;
  onStorySelect: (storyId: string) => void;
  onAgentDispatch: (agent: AgentType, context: AgentContext) => void;
}

// src/components/BMAD/CommunicationBoard/index.tsx
interface CommunicationBoardProps {
  messages: AgentMessage[];
  project: BMadProject;
  onSendMessage: (message: NewAgentMessage) => Promise<void>;
  onFileOpen: (filePath: string) => void;
  onMessageReply: (messageId: string, reply: string) => Promise<void>;
}

// src/components/BMAD/ProjectManager/index.tsx
interface ProjectManagerProps {
  projects: BMadProject[];
  selectedProject: BMadProject | null;
  onProjectSelect: (project: BMadProject) => void;
  onProjectCreate: (projectData: NewProjectData) => Promise<BMadProject>;
  onProjectDelete: (projectId: string) => Promise<void>;
}
```

---

## Performance Requirements

### **Application Performance**
- **Startup Time:** < 3 seconds from launch to functional UI
- **File Change Response:** < 1 second from file change to UI update
- **Memory Usage:** < 200MB typical operation, < 500MB peak
- **CPU Usage:** < 5% idle, < 25% during active file operations

### **File System Performance**
- **Project Discovery:** < 2 seconds to scan and list all BMAD projects
- **State Parsing:** < 100ms to parse and validate state files
- **Communication Parsing:** < 50ms per message file
- **File Watching:** < 10 events/second sustained without performance degradation

### **UI Responsiveness**
- **Component Rendering:** < 16ms per frame (60 FPS)
- **User Input Response:** < 100ms from user action to visual feedback
- **State Updates:** < 200ms from backend state change to UI update
- **Navigation:** < 300ms between different views/components

---

## Integration Requirements

### **IDE Integration Specifications**

```rust
// src-tauri/src/commands/ide.rs
#[derive(Debug, Serialize, Deserialize)]
pub struct IDEInfo {
    pub name: String,
    pub executable_path: PathBuf,
    pub version: Option<String>,
    pub supports_workspace: bool,
    pub supports_files: bool,
}

#[tauri::command]
pub async fn detect_installed_ides() -> Result<Vec<IDEInfo>, String> {
    // Detect VS Code, Cursor, Vim, Emacs, etc.
    // Return capability information for each
}

#[tauri::command]
pub async fn launch_ide_with_context(
    ide_name: String,
    project_path: String,
    story_context: StoryContext,
) -> Result<(), String> {
    // Launch IDE with specific files and context
    // Pass story requirements and architecture docs
}
```

**Supported IDEs:**
- **Primary:** VS Code, Cursor, Windsurf
- **Secondary:** Vim/Neovim, Emacs, Sublime Text
- **Platform-specific:** Xcode (macOS), Visual Studio (Windows)

### **File Format Support**
- **Configuration:** YAML, JSON, TOML
- **Documentation:** Markdown, reStructuredText, AsciiDoc
- **Source Code:** All major languages (detected by extension)
- **Data:** CSV, JSON, XML for project data

---

## Security Requirements

### **File System Security**
- **Path Validation:** All file paths validated against project root
- **Permission Checks:** Verify read/write permissions before operations
- **Sandbox Boundaries:** Restrict file access to project directories
- **Symlink Handling:** Resolve and validate symbolic links safely

### **Data Privacy**
- **Local Storage:** All data stored locally, no cloud transmission
- **Sensitive Data:** No API keys or secrets in communication files
- **Audit Trail:** Log all file operations and agent actions
- **User Control:** Clear consent for all file system operations

### **Application Security**
- **Input Validation:** Sanitize all user inputs and file contents
- **Error Handling:** No sensitive information in error messages
- **Update Security:** Secure update mechanism for application updates
- **Code Signing:** Sign application binaries for platform trust

---

## Testing Requirements

### **Unit Testing**
```rust
// Tests for core BMAD functionality
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_project_state_parsing() {
        // Test YAML state file parsing
    }
    
    #[tokio::test] 
    async fn test_file_watcher_events() {
        // Test file system event handling
    }
    
    #[tokio::test]
    async fn test_agent_message_parsing() {
        // Test communication file parsing
    }
}
```

### **Integration Testing**
- **End-to-End Workflows:** Complete BMAD project lifecycle testing
- **File System Integration:** Real file operations and watching
- **IDE Integration:** Actual IDE launching and context passing
- **Cross-Platform:** Testing on Windows, macOS, and Linux

### **Performance Testing**
- **Load Testing:** Large projects with many files and messages
- **Memory Testing:** Long-running sessions without memory leaks
- **Stress Testing:** High-frequency file changes and updates
- **Benchmark Testing:** Performance regression detection

---

## Deployment Requirements

### **Build Configuration**
```json
// tauri.conf.json updates
{
  "app": {
    "productName": "Organized Agents",
    "version": "1.0.0"
  },
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "identifier": "com.organizedai.organized-agents",
    "publisher": "Organized AI",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png", 
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### **Distribution Targets**
- **Windows:** MSI installer, portable executable
- **macOS:** DMG installer, App Store compatible
- **Linux:** AppImage, Debian package, Flatpak

### **Update Mechanism**
- **Auto-update:** Tauri updater for seamless updates
- **Version Check:** Check for updates on startup
- **User Control:** Allow users to defer updates
- **Rollback:** Ability to rollback to previous version

This technical specification provides the complete blueprint for implementing BMAD Desktop v1.0 with all necessary technical details for successful development.