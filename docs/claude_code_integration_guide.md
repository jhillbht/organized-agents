# Claude Code Integration Guide for BMAD Desktop v1.0

## Project Context for Claude Code

This document provides Claude Code with complete context for implementing the **Organized Agents v1.0 - BMAD Desktop** transformation.

---

## Project Overview

**Current State:** Complex MCP/sandbox orchestration platform (518k tokens, high complexity)  
**Target State:** Accessible BMAD Desktop application with visual workflow management  
**Transformation Goal:** 90% complexity reduction while maintaining education excellence  

### **What We're Building**

A desktop application that enhances the proven BMAD methodology with:
- 🎯 **Visual Workflow Management** - See BMAD process in action
- 💬 **Agent Communication Board** - Visual coordination between AI agents  
- 🎓 **Integrated Academy** - Learn BMAD methodology while building
- 🔧 **IDE Integration** - Works with any development environment
- 📊 **Smart Dispatch** - Intelligent agent recommendations

---

## BMAD Methodology Primer for Claude Code

### **Core BMAD Concepts**

**BMAD = Breakthrough Method for Agile AI-Driven Development**

**Two-Phase Approach:**
1. **Planning Phase:** Detailed PRD and Architecture creation
2. **Development Phase:** Context-rich story execution

**Agent Roles:**
- **Analyst:** Market research and requirements
- **Architect:** Technical architecture design  
- **Product Manager:** Project coordination
- **Product Owner:** Stakeholder management
- **Scrum Master:** Story creation and workflow
- **Developer:** Code implementation
- **QA:** Quality assurance
- **UX Expert:** User experience design

**File Structure:**
```
project/
├── .bmad/                    # Coordination directory
│   ├── communications/       # Agent message passing
│   ├── state.yaml           # Workflow state tracking
│   └── session.yaml         # Session continuity
├── bmad-agent/              # Methodology files
├── docs/                    # Project artifacts
│   ├── prd.md
│   ├── architecture.md
│   └── stories/
└── src/                     # Source code
```

---

## Claude Code Project Commands

### **Phase Execution Commands**

Place these in `.claude/commands/` directory:

#### **`phase1_foundation.md`**
```markdown
# Phase 1: Foundation Implementation

Execute the foundation phase of BMAD Desktop transformation:

1. **Update Dependencies**
   - Remove MCP and sandbox dependencies from Cargo.toml
   - Add BMAD-specific dependencies (serde_yaml, notify, walkdir)
   - Update package.json for new React components

2. **Create Core BMAD Integration**
   - Implement file_watcher.rs for .bmad/ directory monitoring
   - Create state_manager.rs for YAML parsing
   - Build communication.rs for agent message handling
   - Develop workflow.rs for BMAD logic

3. **Simplify Application Entry**
   - Refactor main.rs to remove complex initialization
   - Update Tauri commands for BMAD operations
   - Remove all MCP and sandbox command handlers

**Success Criteria:**
- App starts without MCP dependencies
- Can detect BMAD projects
- File watching works for .bmad/ directories

Use the existing codebase in src-tauri/ as reference but remove complex orchestration systems.
```

#### **`phase2_core_features.md`**
```markdown
# Phase 2: Core Features Implementation

Build the core BMAD Desktop interface:

1. **Workflow Display Component**
   - Visual representation of BMAD phases (Planning → Development → QA)
   - Current story and agent status display
   - Progress indicators and phase transitions
   - Quick action buttons for common tasks

2. **Communication Board**
   - Chat-like interface for agent messages
   - File linking and context preservation
   - Message composition and response capabilities
   - Real-time updates from file system changes

3. **Project Management**
   - BMAD project discovery and listing
   - Project creation wizard
   - Project switching and state management
   - Integration with existing file structure

**Success Criteria:**
- Visual workflow accurately reflects .bmad/state.yaml
- Communication board displays messages from .bmad/communications/
- Can create and manage multiple BMAD projects

Leverage existing React components from src/components/ where possible.
```

#### **`phase3_agent_integration.md`**
```markdown
# Phase 3: Agent Integration

Implement smart agent dispatch and IDE integration:

1. **Agent Dispatch System**
   - Analyze current BMAD state to suggest next agent
   - Manual agent selection and override controls
   - Context-aware recommendations based on workflow
   - Integration with BMAD methodology rules

2. **IDE Integration**
   - Detect installed IDEs (VS Code, Cursor, etc.)
   - Launch IDEs with project context and relevant files
   - Pass story context and architecture references
   - Support for multiple IDE preferences

3. **Enhanced Communication**
   - Auto-generate handoff messages between agents
   - Preserve context across agent transitions
   - Smart notifications for workflow state changes
   - Session continuity across app restarts

**Success Criteria:**
- Suggests appropriate agent based on BMAD phase
- Successfully launches IDEs with context
- Agent handoffs include relevant information

Focus on simplicity and reliability over complex automation.
```

#### **`phase4_education.md`**
```markdown
# Phase 4: Education Integration

Adapt the existing academy system for BMAD methodology:

1. **BMAD Academy Content**
   - Create lessons specific to BMAD methodology
   - Interactive tutorials using real project examples
   - Contextual suggestions based on current project phase
   - Progress tracking tied to actual workflow milestones

2. **Context-Aware Learning**
   - Hook into project state for personalized lessons
   - Practice exercises using user's actual project data
   - Achievement system for BMAD mastery
   - Team learning and knowledge sharing features

3. **Polish and Integration**
   - Seamless integration with existing education system
   - UI/UX refinement and optimization
   - Comprehensive testing and bug fixes
   - Documentation and help system

**Success Criteria:**
- Academy suggests relevant lessons for current project phase
- Can practice BMAD concepts with real project data
- Learning progress tied to actual workflow success

Preserve the existing academy architecture from src/academy/ and adapt content.
```

---

## Project Context Files

### **`project_context.md`**

```markdown
# Complete Project Context

## Current Codebase Analysis

**Organized Agents** is currently a sophisticated desktop application with:
- **Tauri architecture** (Rust backend + React frontend)
- **Complex sandbox system** for agent execution
- **MCP protocol** implementation
- **Education system** with interactive academy
- **15+ specialized agents** for various tasks

## What to Keep (High Value)
- ✅ Tauri app structure and build system
- ✅ React UI components (60-70% reusable)
- ✅ Complete education/academy system
- ✅ Icon generation and deployment scripts

## What to Remove (Complexity Sources)
- ❌ Sandbox isolation systems (`src-tauri/src/sandbox/`)
- ❌ MCP protocol implementation (`src-tauri/src/commands/mcp.rs`)
- ❌ Process management (`src-tauri/src/process/`)
- ❌ Complex orchestration (`src-tauri/src/commands/orchestration.rs`)

## What to Transform
- 🔄 Agent execution → Visual workflow display
- 🔄 MCP communication → File-based coordination  
- 🔄 Sandbox monitoring → BMAD state tracking
- 🔄 Process registry → Project management

## Architecture Goals
- **Simplicity:** File-based coordination instead of real-time orchestration
- **Reliability:** File watching and YAML parsing instead of complex protocols
- **Accessibility:** Visual enhancement of proven BMAD methodology
- **Education:** Integrated learning tied to real project work
```

### **`existing_codebase_analysis.md`**

```markdown
# Existing Codebase Analysis for Claude Code

## Key Components to Leverage

### **React Frontend (Reusable)**
```
src/components/
├── ✅ Academy/              # Direct reuse - education system
├── ✅ EducationDashboard/   # Keep existing functionality
├── ✅ ui/                   # All UI components reusable
├── ✅ Settings/             # Adapt for BMAD configuration
├── ✅ ProjectList/          # Adapt for BMAD projects
└── 🔄 Agent components     # Transform for BMAD workflow
```

### **Rust Backend (Simplify)**
```
src-tauri/src/
├── ✅ main.rs              # Simplify initialization
├── ✅ lib.rs               # Refactor module exports
├── 🔄 commands/            # Replace with BMAD commands
├── ✅ academy/             # Keep education backend
└── ❌ Complex systems      # Remove entirely
```

### **Build and Infrastructure (Keep)**
```
├── ✅ package.json         # Build system
├── ✅ Cargo.toml           # Update dependencies only
├── ✅ tauri.conf.json      # Minor configuration updates
├── ✅ scripts/             # Build and deployment scripts
└── ✅ .github/workflows/   # CI/CD pipelines
```

## Implementation Strategy

1. **Preserve Working Systems:** Keep education and UI components
2. **Selective Removal:** Remove only complex orchestration
3. **Gradual Replacement:** Replace MCP with file-based coordination
4. **Incremental Testing:** Ensure each change maintains app functionality
```

---

## Development Guidelines for Claude Code

### **Code Style and Patterns**

1. **Rust Backend**
   - Use existing error handling patterns
   - Follow current module organization
   - Maintain async/await patterns for file operations
   - Preserve existing logging and debugging features

2. **React Frontend**  
   - Use existing component patterns and styling
   - Maintain TypeScript types and interfaces
   - Follow current state management approach
   - Preserve accessibility and responsive design

3. **Integration Patterns**
   - Use existing Tauri command patterns
   - Maintain current API interfaces where possible
   - Follow established event handling patterns
   - Preserve existing configuration management

### **File Organization**

**When creating new files:**
- Place BMAD logic in `src-tauri/src/bmad/`
- Add new React components in `src/components/`
- Update command handlers in `src-tauri/src/commands/`
- Document new APIs in existing documentation structure

**When modifying existing files:**
- Remove unused imports and dependencies
- Update function signatures for BMAD data structures
- Maintain existing error handling patterns
- Preserve logging and debugging capabilities

---

## Testing and Validation

### **Phase Completion Validation**

After each phase, verify:

1. **Application Startup**
   - App launches without errors
   - All UI components render correctly
   - No console errors or warnings

2. **Core Functionality**
   - BMAD project detection works
   - File watching responds to changes
   - UI updates reflect file system state

3. **Integration Points**
   - Education system remains functional
   - Existing components work with new data
   - Build and deployment processes work

### **Manual Testing Scenarios**

1. **Create a test BMAD project with sample files**
2. **Verify workflow visualization updates correctly**
3. **Test agent communication message display**
4. **Validate IDE launching and integration**
5. **Confirm education system adaptation**

---

## Troubleshooting Guide

### **Common Issues and Solutions**

1. **Compilation Errors**
   - Check dependency versions in Cargo.toml
   - Verify all imports are updated
   - Ensure TypeScript types are correct

2. **File Watching Issues**
   - Test with simple .bmad directory structure
   - Check file permissions and access
   - Verify debouncing and event handling

3. **UI Component Issues**
   - Check props and state management
   - Verify data flow from backend to frontend
   - Test responsive design and accessibility

4. **Integration Problems**
   - Test Tauri command execution
   - Verify JSON serialization/deserialization
   - Check async/await error handling

---

## Success Criteria Summary

**Phase 1 Complete:** Basic BMAD integration and file watching working  
**Phase 2 Complete:** Visual workflow and communication board functional  
**Phase 3 Complete:** Agent dispatch and IDE integration operational  
**Phase 4 Complete:** Education system adapted and fully integrated  

**Final Success:** A working BMAD Desktop application that enhances the proven BMAD methodology with visual workflow management, intelligent agent coordination, and integrated learning system.