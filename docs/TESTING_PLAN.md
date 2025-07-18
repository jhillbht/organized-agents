# BMAD Desktop Testing Plan

## Overview

This document outlines the comprehensive testing strategy for the BMAD Desktop application, including test infrastructure, coverage goals, and execution procedures.

## Testing Infrastructure

### Framework Stack
- **Test Runner**: Vitest 3.2.4
- **Testing Library**: React Testing Library 16.3.0  
- **User Events**: @testing-library/user-event 14.6.1
- **DOM Assertions**: @testing-library/jest-dom 6.6.3
- **Environment**: jsdom 26.1.0
- **Coverage**: Vitest v8 provider

### Configuration Files
- `vitest.config.ts` - Main Vitest configuration
- `src/test/setup.ts` - Global test setup and mocks
- `src/test/test-utils.tsx` - Custom render utilities and mock data generators

## Test Categories

### 1. Unit Tests

#### UI Components (`src/components/ui/__tests__/`)
**Purpose**: Test individual UI components in isolation
**Coverage**:
- ✅ Button component (`button.test.tsx`)
  - Rendering with different variants (default, outline, ghost)
  - Size variations (sm, lg)
  - Disabled state handling
  - Click event handling
  - asChild prop functionality

**Future Components to Test**:
- Card, Dialog, Input, Select, Toast, Tooltip
- Form components (Checkbox, Radio, Switch)
- Layout components (Tabs, Progress, Pagination)

#### BMAD Components (`src/components/BMAD/__tests__/`)
**Purpose**: Test BMAD-specific business logic components
**Coverage**:
- ✅ BMadProjectList (`BMadProjectList.test.tsx`)
  - Project list rendering
  - Phase indicators and badges
  - Active project highlighting
  - Communication indicators
  - Time-based information display
  - Empty state handling
  - Click interactions

**Future Components to Test**:
- AgentDispatcher - Agent management and dispatch logic
- WorkflowDisplay - Phase transitions and workflow status
- CommunicationBoard - Message handling and filtering
- ProjectCreator - Project creation workflow

#### Custom Hooks (`src/hooks/__tests__/`)
**Purpose**: Test custom React hooks behavior
**Coverage**:
- ✅ useToast (`useToast.test.ts`)
  - Toast creation and management
  - Auto-removal timers
  - Multiple toast handling
  - Variant support
  - Console logging

**Future Hooks to Test**:
- useContextualLearning - Learning recommendations and context awareness
- useBMadProject - Project state management
- useAgentDispatcher - Agent coordination logic

### 2. Integration Tests

#### Workflow Integration (`src/test/integration/`)
**Purpose**: Test component interactions and data flow
**Coverage**:
- ✅ BMAD Project Workflow (`bmad-project-workflow.test.tsx`)
  - Multi-project display and management
  - Phase information integration
  - Agent status coordination
  - Communication workflow
  - Time-based updates
  - User interaction flows

**Future Integration Tests**:
- Agent dispatch workflow
- Project creation to management flow
- Communication board with project updates
- Education system integration
- File system operations

### 3. End-to-End Tests (Planned)

#### User Workflows
**Purpose**: Test complete user journeys
**Planned Coverage**:
- Project creation and initialization
- Agent assignment and task management
- Phase transitions and approvals
- Communication flow between agents
- Education system interaction
- File operations and project persistence

#### Tauri Integration
**Purpose**: Test desktop app functionality
**Planned Coverage**:
- File system access
- Directory watching
- Native dialogs
- Window management
- Inter-process communication

## Test Utilities and Mocks

### Mock Data Generators
Located in `src/test/test-utils.tsx`:

```typescript
// Project mock with realistic BMAD structure
mockBMadProject(overrides = {})

// Education system mocks
mockBMadLesson(overrides = {})
mockAgentRecommendation(overrides = {})

// Tauri API mocking
mockTauriInvoke(command: string, response: any)
```

### Test Environment Setup
- **Tauri APIs**: Fully mocked for testing
- **File System**: Mock implementations
- **Timers**: Controllable via vitest fake timers
- **Window APIs**: matchMedia and IntersectionObserver mocked

## Coverage Goals

### Current Coverage
- **UI Components**: 100% (Button)
- **BMAD Components**: 100% (BMadProjectList)
- **Hooks**: 100% (useToast)
- **Integration**: Basic workflow coverage

### Target Coverage
- **Overall**: 85%+ line coverage
- **Critical Paths**: 100% coverage for:
  - Project management workflow
  - Agent dispatch logic
  - Phase transition validation
  - Data persistence operations

### Coverage Exclusions
- Type definitions
- Configuration files
- Mock implementations
- External library integrations (where not customized)

## Running Tests

### Available Commands

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/components/ui/__tests__/Button.test.tsx

# Run tests in watch mode
npx vitest src/components

# Run integration tests only
npx vitest run src/test/integration
```

### CI/CD Integration

```bash
# Production test run (non-interactive)
npm run test -- --run --coverage

# Fail on low coverage
npm run test -- --run --coverage --coverage.threshold.lines=85
```

## Test Development Guidelines

### Writing Component Tests
1. **Use descriptive test names** that explain the behavior being tested
2. **Test user interactions** rather than implementation details
3. **Use real user events** via @testing-library/user-event
4. **Mock external dependencies** appropriately
5. **Test accessibility** features when applicable

### Mock Strategy
- **Tauri APIs**: Always mocked for unit/integration tests
- **External APIs**: Mock at the service layer
- **Time-dependent code**: Use vitest fake timers
- **File operations**: Mock file system interactions

### Test Structure
```typescript
describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Happy path tests
  it('renders correctly with default props', () => {
    // Test implementation
  });

  // Edge cases
  it('handles empty state', () => {
    // Test implementation
  });

  // User interactions
  it('handles user clicks', async () => {
    // Test implementation with user events
  });

  // Error conditions
  it('displays error states appropriately', () => {
    // Test implementation
  });
});
```

## Quality Metrics

### Test Quality Indicators
- **Fast execution**: Unit tests < 100ms, Integration tests < 1s
- **Reliable**: No flaky tests, deterministic outcomes
- **Maintainable**: Tests should survive refactoring
- **Readable**: Clear test intentions and assertions

### Monitoring
- **Coverage reports**: Generated on each test run
- **Performance tracking**: Test execution time monitoring
- **Flakiness detection**: Identify unstable tests
- **Maintenance burden**: Regular review of test complexity

## Future Enhancements

### Planned Improvements
1. **Visual regression testing** for UI components
2. **Performance testing** for large project lists
3. **Accessibility testing** automation
4. **Cross-platform testing** (Windows, macOS, Linux)
5. **Load testing** for agent management
6. **Security testing** for file operations

### Tool Considerations
- **Playwright** for E2E testing
- **Storybook** for component development and testing
- **MSW** for API mocking in integration tests
- **Chromatic** for visual regression testing

## Conclusion

This testing plan provides a solid foundation for ensuring BMAD Desktop quality and reliability. The current implementation covers core functionality with unit and integration tests, while leaving room for expansion as the application grows.

Regular review and updates to this plan will ensure it remains aligned with the application's evolution and testing best practices.