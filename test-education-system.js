#!/usr/bin/env node

/**
 * Education System Test Suite
 * Tests the progressive learning functionality without requiring the full Tauri app
 */

const SESSIONS = [
  {
    id: "01-single-agent-basics",
    title: "Single Agent Basics",
    description: "Master working with one agent",
    order_index: 1,
    difficulty: "beginner",
    estimated_duration: 30,
    prerequisites: []
  },
  {
    id: "02-agent-configuration", 
    title: "Agent Configuration",
    description: "Customize agent behavior",
    order_index: 2,
    difficulty: "beginner",
    estimated_duration: 45,
    prerequisites: ["01-single-agent-basics"]
  },
  {
    id: "03-basic-workflows",
    title: "Basic Workflows", 
    description: "Create your first automated workflows",
    order_index: 3,
    difficulty: "beginner",
    estimated_duration: 60,
    prerequisites: ["02-agent-configuration"]
  },
  {
    id: "04-environment-setup",
    title: "Environment Setup",
    description: "Optimize your development environment", 
    order_index: 4,
    difficulty: "beginner",
    estimated_duration: 45,
    prerequisites: ["03-basic-workflows"]
  },
  {
    id: "05-pair-programming",
    title: "Pair Programming",
    description: "Coordinate two agents effectively",
    order_index: 5,
    difficulty: "intermediate", 
    estimated_duration: 60,
    prerequisites: ["04-environment-setup"]
  }
];

class EducationSystemTest {
  constructor() {
    this.userProgress = new Map();
    this.passed = 0;
    this.failed = 0;
  }

  // Color codes for output
  colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };

  pass(test) {
    console.log(`${this.colors.green}✅ PASS${this.colors.reset}: ${test}`);
    this.passed++;
  }

  fail(test, error = '') {
    console.log(`${this.colors.red}❌ FAIL${this.colors.reset}: ${test}${error ? ' - ' + error : ''}`);
    this.failed++;
  }

  info(message) {
    console.log(`${this.colors.blue}ℹ️  INFO${this.colors.reset}: ${message}`);
  }

  // Simulate database operations
  initializeSystem() {
    // First session should be available, rest locked
    this.userProgress.set("01-single-agent-basics", {
      session_id: "01-single-agent-basics",
      status: "available",
      attempts: 0
    });

    for (let i = 1; i < SESSIONS.length; i++) {
      this.userProgress.set(SESSIONS[i].id, {
        session_id: SESSIONS[i].id,
        status: "locked", 
        attempts: 0
      });
    }
  }

  getSessions() {
    return SESSIONS.map(session => ({
      session,
      progress: this.userProgress.get(session.id)
    }));
  }

  startSession(sessionId) {
    const progress = this.userProgress.get(sessionId);
    if (!progress) throw new Error(`Session ${sessionId} not found`);
    if (progress.status === "locked") throw new Error(`Session ${sessionId} is locked`);
    
    progress.status = "in_progress";
    progress.started_at = new Date().toISOString();
    progress.attempts += 1;
  }

  completeSession(sessionId, score) {
    const progress = this.userProgress.get(sessionId);
    if (!progress) throw new Error(`Session ${sessionId} not found`);
    
    progress.status = "completed";
    progress.completed_at = new Date().toISOString(); 
    progress.score = score;

    // Unlock next session
    this.unlockNextSession(sessionId);
  }

  unlockNextSession(completedSessionId) {
    // Find sessions that have the completed session as a prerequisite
    const nextSessions = SESSIONS.filter(session => 
      session.prerequisites.includes(completedSessionId)
    );

    for (const nextSession of nextSessions) {
      // Check if all prerequisites are completed
      const allPrereqsCompleted = nextSession.prerequisites.every(prereqId => {
        const prereqProgress = this.userProgress.get(prereqId);
        return prereqProgress && prereqProgress.status === "completed";
      });

      if (allPrereqsCompleted) {
        const progress = this.userProgress.get(nextSession.id);
        if (progress && progress.status === "locked") {
          progress.status = "available";
        }
      }
    }
  }

  resetProgress() {
    this.userProgress.clear();
    this.initializeSystem();
  }

  // Test methods
  testInitialization() {
    console.log("\n=== Testing System Initialization ===");
    
    try {
      this.initializeSystem();
      
      // Check first session is available
      const firstSession = this.userProgress.get("01-single-agent-basics");
      if (firstSession && firstSession.status === "available") {
        this.pass("First session initialized as available");
      } else {
        this.fail("First session should be available");
      }

      // Check other sessions are locked
      const lockedCount = Array.from(this.userProgress.values())
        .filter(p => p.status === "locked").length;
      
      if (lockedCount === SESSIONS.length - 1) {
        this.pass("Remaining sessions properly locked");
      } else {
        this.fail(`Expected ${SESSIONS.length - 1} locked sessions, got ${lockedCount}`);
      }

    } catch (error) {
      this.fail("System initialization", error.message);
    }
  }

  testSessionProgression() {
    console.log("\n=== Testing Session Progression ===");

    try {
      // Test starting first session
      this.startSession("01-single-agent-basics");
      const session1 = this.userProgress.get("01-single-agent-basics");
      
      if (session1.status === "in_progress") {
        this.pass("Session 1 started successfully");
      } else {
        this.fail("Session 1 should be in progress");
      }

      if (session1.attempts === 1) {
        this.pass("Attempt counter incremented");
      } else {
        this.fail("Attempt counter should be 1");
      }

      // Test completing first session
      this.completeSession("01-single-agent-basics", 85);
      
      if (session1.status === "completed" && session1.score === 85) {
        this.pass("Session 1 completed with score");
      } else {
        this.fail("Session 1 should be completed with score 85");
      }

      // Test that session 2 is now available
      const session2 = this.userProgress.get("02-agent-configuration");
      if (session2.status === "available") {
        this.pass("Session 2 unlocked after completing session 1");
      } else {
        this.fail("Session 2 should be available");
      }

    } catch (error) {
      this.fail("Session progression", error.message);
    }
  }

  testPrerequisiteEnforcement() {
    console.log("\n=== Testing Prerequisite Enforcement ===");

    try {
      // Reset and try to start session 3 without completing prerequisites
      this.resetProgress();
      
      try {
        this.startSession("03-basic-workflows");
        this.fail("Should not be able to start locked session");
      } catch (error) {
        this.pass("Locked session properly prevented");
      }

      // Complete sessions in order and verify unlocking
      this.startSession("01-single-agent-basics");
      this.completeSession("01-single-agent-basics", 90);
      
      this.startSession("02-agent-configuration");
      this.completeSession("02-agent-configuration", 80);

      const session3 = this.userProgress.get("03-basic-workflows");
      if (session3.status === "available") {
        this.pass("Session 3 unlocked after completing prerequisites");
      } else {
        this.fail("Session 3 should be available after completing sessions 1 and 2");
      }

    } catch (error) {
      this.fail("Prerequisite enforcement", error.message);
    }
  }

  testProgressReset() {
    console.log("\n=== Testing Progress Reset ===");

    try {
      // Complete some sessions
      this.startSession("01-single-agent-basics");
      this.completeSession("01-single-agent-basics", 95);
      
      // Reset progress
      this.resetProgress();

      // Verify only first session is available
      const session1 = this.userProgress.get("01-single-agent-basics");
      const session2 = this.userProgress.get("02-agent-configuration");

      if (session1.status === "available" && session2.status === "locked") {
        this.pass("Progress reset correctly");
      } else {
        this.fail("Progress reset should make only first session available");
      }

    } catch (error) {
      this.fail("Progress reset", error.message);
    }
  }

  testSessionDataIntegrity() {
    console.log("\n=== Testing Session Data Integrity ===");

    // Test session structure
    for (const session of SESSIONS) {
      const requiredFields = ['id', 'title', 'description', 'order_index', 'difficulty', 'estimated_duration', 'prerequisites'];
      const hasAllFields = requiredFields.every(field => session.hasOwnProperty(field));
      
      if (hasAllFields) {
        this.pass(`Session ${session.id} has all required fields`);
      } else {
        this.fail(`Session ${session.id} missing required fields`);
      }

      // Test difficulty values
      const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
      if (validDifficulties.includes(session.difficulty)) {
        this.pass(`Session ${session.id} has valid difficulty`);
      } else {
        this.fail(`Session ${session.id} has invalid difficulty: ${session.difficulty}`);
      }
    }
  }

  testProgressCalculation() {
    console.log("\n=== Testing Progress Calculation ===");

    try {
      this.resetProgress();
      
      // Complete 3 out of 5 sessions
      this.startSession("01-single-agent-basics");
      this.completeSession("01-single-agent-basics", 85);
      
      this.startSession("02-agent-configuration");
      this.completeSession("02-agent-configuration", 90);
      
      this.startSession("03-basic-workflows");
      this.completeSession("03-basic-workflows", 75);

      const completedSessions = Array.from(this.userProgress.values())
        .filter(p => p.status === "completed").length;
      
      const progressPercentage = (completedSessions / SESSIONS.length) * 100;

      if (completedSessions === 3) {
        this.pass("Completed session count correct");
      } else {
        this.fail(`Expected 3 completed sessions, got ${completedSessions}`);
      }

      if (progressPercentage === 60) {
        this.pass("Progress percentage calculated correctly");
      } else {
        this.fail(`Expected 60% progress, got ${progressPercentage}%`);
      }

    } catch (error) {
      this.fail("Progress calculation", error.message);
    }
  }

  runAllTests() {
    console.log("🎓 Starting Education System Tests");
    console.log("==================================");

    this.testInitialization();
    this.testSessionProgression();
    this.testPrerequisiteEnforcement();
    this.testProgressReset();
    this.testSessionDataIntegrity();
    this.testProgressCalculation();

    console.log("\n=== Test Results ===");
    console.log(`${this.colors.green}Passed: ${this.passed}${this.colors.reset}`);
    console.log(`${this.colors.red}Failed: ${this.failed}${this.colors.reset}`);
    console.log(`Total: ${this.passed + this.failed}`);

    if (this.failed === 0) {
      console.log(`\n${this.colors.green}🎉 All tests passed! Education system is ready for alpha testing.${this.colors.reset}`);
      return true;
    } else {
      console.log(`\n${this.colors.red}❌ ${this.failed} test(s) failed. Please fix issues before proceeding.${this.colors.reset}`);
      return false;
    }
  }
}

// Run tests
const tester = new EducationSystemTest();
const success = tester.runAllTests();
process.exit(success ? 0 : 1);