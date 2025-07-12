# Education System Test Guide

## Overview
This guide will help you manually test the progressive learning system in Organized AI.

## Test Setup

### 1. Start the Application
```bash
cd organized-agents
cp .env.example .env  # Add your API keys
bun install
bun run tauri dev
```

### 2. Navigate to Education Dashboard
- Click the **"Education"** tab in the main navigation
- Or click the graduation cap icon (🎓) in the top bar

## Progressive Learning Tests

### Test 1: Initial State Validation
**Expected Behavior:**
- ✅ Only "Single Agent Basics" should be available (unlocked)
- ✅ All other sessions should show as locked (🔒)
- ✅ Progress bar should show 0% completion
- ✅ Overall stats should show "0 of 16 sessions completed"

### Test 2: Session Information Display
**Check Each Session Card:**
- ✅ Difficulty badge (beginner/intermediate/advanced/expert)
- ✅ Estimated duration in minutes
- ✅ Clear session title and description
- ✅ Proper status icons (🔒 locked, ▶️ available, ✅ completed)

### Test 3: Session Progression
**Steps:**
1. Click "Start Session" on "Single Agent Basics"
2. **Expected:** Session opens lovable.dev link in new tab
3. **Expected:** Session status changes to "In Progress"
4. **Expected:** Button text changes to "Continue Session"

### Test 4: Session Completion Simulation
**Steps:**
1. Open browser dev tools (F12)
2. Navigate to Education Dashboard
3. In console, run:
```javascript
// Simulate completing the first session
await window.__TAURI__.invoke('complete_education_session', {
  sessionId: '01-single-agent-basics',
  score: 85
});
// Reload the page to see changes
location.reload();
```

**Expected Results:**
- ✅ "Single Agent Basics" shows as completed (✅)
- ✅ Score displays (85%)
- ✅ "Agent Configuration" becomes available
- ✅ Progress bar updates to show 1/16 sessions (6.25%)

### Test 5: Progressive Unlocking
**Complete sessions in order to test the progression:**

1. **Session 1 → 2**: Complete "Single Agent Basics" → "Agent Configuration" unlocks
2. **Session 2 → 3**: Complete "Agent Configuration" → "Basic Workflows" unlocks  
3. **Session 3 → 4**: Complete "Basic Workflows" → "Environment Setup" unlocks
4. **Session 4 → 5**: Complete "Environment Setup" → "Pair Programming" unlocks

**JavaScript Console Commands:**
```javascript
// Complete session 2
await window.__TAURI__.invoke('complete_education_session', {
  sessionId: '02-agent-configuration', 
  score: 90
});

// Complete session 3
await window.__TAURI__.invoke('complete_education_session', {
  sessionId: '03-basic-workflows',
  score: 78
});

// Reload to see changes
location.reload();
```

### Test 6: Progress Reset Functionality
**Steps:**
1. Click the refresh icon (↻) in the top-right corner
2. Confirm the reset in the dialog
3. **Expected:** All progress resets to initial state
4. **Expected:** Only first session is available again

### Test 7: Session Details Modal
**Steps:**
1. Click on any session card (not the button)
2. **Expected:** Modal opens with detailed information
3. **Check:** Prerequisites list for advanced sessions
4. **Check:** Duration and difficulty information
5. **Check:** lovable.dev integration description

### Test 8: External Integration
**Steps:**
1. Start any available session
2. **Expected:** Opens `https://agent-journey-academy.lovable.app/session/{sessionId}`
3. **Note:** This URL may not be fully functional yet (alpha software)

## Database Validation Tests

### Test 9: Data Persistence
**Steps:**
1. Complete a few sessions
2. Close the application completely
3. Restart the application
4. Navigate to Education Dashboard
5. **Expected:** Progress is maintained across restarts

### Test 10: Error Handling
**Test Error Scenarios:**
1. Try to access locked sessions directly via browser console
2. **Expected:** Proper error messages
3. Try invalid session IDs
4. **Expected:** Graceful error handling

## 16-Session Curriculum Validation

### Complete Session List (for reference):
1. **Beginner Path:**
   - 01-single-agent-basics (30 min)
   - 02-agent-configuration (45 min)
   - 03-basic-workflows (60 min)
   - 04-environment-setup (45 min)

2. **Intermediate Path:**
   - 05-pair-programming (60 min)
   - 06-handoff-patterns (90 min)
   - 07-parallel-tasks (90 min)
   - 08-error-recovery (60 min)

3. **Advanced Path:**
   - 09-multi-agent-projects (120 min)
   - 10-complex-workflows (120 min)
   - 11-performance-optimization (90 min)
   - 12-production-patterns (120 min)

4. **Expert Path:**
   - 13-custom-agent-creation (180 min)
   - 14-advanced-orchestration (180 min)
   - 15-system-integration (150 min)
   - 16-community-contribution (120 min)

### Curriculum Flow Test
**Validate that sessions unlock in the correct order and prerequisites are enforced.**

## Success Criteria

### ✅ All Tests Should Pass:
- Progressive unlocking works correctly
- Session data persists across app restarts
- UI properly reflects current progress state
- External integration attempts to open lovable.dev
- Error handling works gracefully
- Reset functionality works completely

### 🎯 Alpha Testing Ready Indicators:
- Clean, professional UI with proper status indicators
- Smooth user experience with clear feedback
- Robust data management with SQLite backend
- Proper integration points for external learning platform
- Comprehensive session metadata and progress tracking

## Troubleshooting

### Common Issues:
1. **Sessions not loading:** Check console for Tauri invoke errors
2. **Progress not persisting:** Verify SQLite database permissions
3. **External links not working:** Expected in alpha - lovable.dev integration in progress
4. **UI not updating:** Try refreshing the page after database operations

### Database Location:
- **macOS:** `~/Library/Application Support/organized-agents/education.db`
- **Windows:** `%APPDATA%/organized-agents/education.db`
- **Linux:** `~/.local/share/organized-agents/education.db`

---

**Note:** This is alpha software. Some features may not be fully implemented yet. Focus testing on the core progressive learning mechanics and database operations.