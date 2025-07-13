// Sample lesson content for the Agent Journey Academy

export const sampleLessons = {
  // Module 1: Foundation Lessons
  "agent-basics-1": {
    id: "agent-basics-1",
    title: "Introduction to AI Agents",
    description: "Learn the fundamental concepts of AI agents and their capabilities",
    learningObjectives: [
      "Understand what AI agents are and how they work",
      "Identify different types of AI agents",
      "Learn about agent autonomy and decision-making",
      "Explore real-world applications of AI agents"
    ],
    theory: `# Introduction to AI Agents

## What are AI Agents?

AI agents are autonomous software entities that can:
- **Perceive** their environment through sensors or data inputs
- **Process** information using AI algorithms and reasoning
- **Act** upon their environment to achieve specific goals
- **Learn** from experience to improve performance over time

## Types of AI Agents

### 1. Reactive Agents
- Respond directly to current inputs
- No memory of past states
- Simple stimulus-response behavior

### 2. Deliberative Agents
- Maintain internal models of the world
- Plan actions based on goals
- Use reasoning to make decisions

### 3. Learning Agents
- Improve performance through experience
- Adapt to new situations
- Use machine learning techniques

## Agent Architecture

\`\`\`
Environment → Sensors → Agent (Processing) → Actuators → Environment
                ↑                            ↓
              Feedback ←――――――――――――――――――――
\`\`\`

## Real-World Applications

- **Autonomous vehicles** - Navigation and driving decisions
- **Trading bots** - Financial market analysis and trading
- **Game AI** - NPCs and strategic planning
- **Personal assistants** - Task automation and recommendations
- **Robotics** - Physical world interaction and manipulation`,
    starterCode: `// Let's create a simple AI agent class
class SimpleAgent {
    constructor(name) {
        this.name = name;
        this.memory = [];
        this.goals = [];
    }
    
    // Perceive information from environment
    perceive(input) {
        this.memory.push({
            timestamp: Date.now(),
            input: input
        });
        return input;
    }
    
    // Process information and make decisions
    process() {
        // TODO: Implement decision-making logic
        return null;
    }
    
    // Act upon the environment
    act(action) {
        console.log(\`\${this.name} performs action: \${action}\`);
        return action;
    }
}

// Create and test your agent
const agent = new SimpleAgent("MyFirstAgent");
agent.perceive("sensor data");
console.log(agent.memory);`,
    language: "javascript" as const,
    difficulty: "beginner" as const,
    estimatedTime: 15,
    exercise: {
      id: "agent-basics-1-exercise",
      title: "Create Your First Agent",
      description: "Implement the process() method to make the agent respond to different types of input",
      difficulty: "beginner" as const,
      language: "javascript",
      xpReward: 100,
      testCases: [
        {
          id: "test-1",
          description: "Agent should respond to 'danger' input with 'flee' action",
          input: "danger",
          expectedOutput: "flee"
        },
        {
          id: "test-2", 
          description: "Agent should respond to 'food' input with 'approach' action",
          input: "food",
          expectedOutput: "approach"
        },
        {
          id: "test-3",
          description: "Agent should respond to unknown input with 'explore' action",
          input: "unknown",
          expectedOutput: "explore"
        }
      ],
      hints: [
        "Use if-else statements or switch case to handle different inputs",
        "The process() method should return an action string",
        "Remember to handle the default case for unknown inputs"
      ]
    }
  },

  "prompt-engineering-1": {
    id: "prompt-engineering-1", 
    title: "Prompt Engineering Fundamentals",
    description: "Master the art of crafting effective prompts for AI agents",
    learningObjectives: [
      "Understand the importance of prompt engineering",
      "Learn prompt structure and components",
      "Practice writing clear and specific prompts",
      "Explore advanced prompt techniques"
    ],
    theory: `# Prompt Engineering Fundamentals

## What is Prompt Engineering?

Prompt engineering is the practice of designing and optimizing input prompts to get the best possible outputs from AI models. It's both an art and a science that requires understanding how AI systems interpret and respond to human language.

## Key Principles

### 1. Clarity and Specificity
- Be explicit about what you want
- Avoid ambiguous language
- Provide context when necessary

### 2. Structure and Format
- Use consistent formatting
- Break complex requests into steps
- Specify desired output format

### 3. Context and Examples
- Provide relevant background information
- Include examples when helpful
- Set the appropriate tone and style

## Prompt Anatomy

\`\`\`
[Context] + [Instruction] + [Input] + [Output Format] = Effective Prompt
\`\`\`

### Example:
**Context:** "You are a helpful coding assistant."
**Instruction:** "Explain the following JavaScript concept"
**Input:** "Closures"
**Output Format:** "Provide a definition, example, and use case."

## Advanced Techniques

### Chain of Thought
Guide the AI through step-by-step reasoning:
"Let's think through this step by step..."

### Role Playing
Assign specific roles or personas:
"Act as a senior software engineer reviewing this code..."

### Few-Shot Learning
Provide examples of input-output pairs:
"Here are some examples: Input: X, Output: Y"`,
    starterCode: `// Prompt Engineering Challenge
// Create a function that generates effective prompts

function generatePrompt(context, task, format) {
    // TODO: Combine the components into an effective prompt
    // Consider: clarity, structure, and specificity
    
    return "";
}

// Test cases
const context = "You are an expert code reviewer";
const task = "Review this Python function for bugs and improvements";
const format = "Provide specific feedback with line numbers and suggestions";

const prompt = generatePrompt(context, task, format);
console.log(prompt);`,
    language: "javascript" as const,
    difficulty: "intermediate" as const,
    estimatedTime: 20,
    exercise: {
      id: "prompt-engineering-1-exercise",
      title: "Build a Prompt Generator",
      description: "Create a function that combines context, task, and format into an effective prompt",
      difficulty: "intermediate" as const,
      language: "javascript",
      xpReward: 150,
      testCases: [
        {
          id: "test-1",
          description: "Should combine all components with proper formatting",
          input: ["Expert", "Analyze code", "List format"],
          expectedOutput: "Expert: Analyze code. Format: List format"
        },
        {
          id: "test-2",
          description: "Should handle empty components gracefully",
          input: ["", "Task only", ""],
          expectedOutput: "Task only"
        }
      ],
      hints: [
        "Consider how to format and separate different components",
        "Handle cases where some components might be empty",
        "Think about the order and structure of the final prompt"
      ]
    }
  },

  "multi-agent-coordination": {
    id: "multi-agent-coordination",
    title: "Multi-Agent Coordination",
    description: "Learn how multiple agents can work together to solve complex problems",
    learningObjectives: [
      "Understand multi-agent systems architecture",
      "Learn coordination patterns and protocols",
      "Implement agent communication mechanisms",
      "Explore distributed problem-solving strategies"
    ],
    theory: `# Multi-Agent Coordination

## Why Multi-Agent Systems?

Single agents have limitations:
- **Processing power** - Limited computational resources
- **Knowledge** - Restricted domain expertise  
- **Perspective** - Single viewpoint on problems
- **Scalability** - Cannot handle massive parallel tasks

Multi-agent systems provide:
- **Distributed processing** - Parallel computation
- **Specialized expertise** - Domain-specific agents
- **Redundancy** - Fault tolerance and reliability
- **Emergent behavior** - Complex solutions from simple interactions

## Coordination Patterns

### 1. Hierarchical Coordination
\`\`\`
    Master Agent
   /     |     \\
Agent1  Agent2  Agent3
\`\`\`

### 2. Peer-to-Peer Coordination
\`\`\`
Agent1 ←→ Agent2
  ↕        ↕
Agent3 ←→ Agent4
\`\`\`

### 3. Market-Based Coordination
- Agents bid for tasks
- Economic principles drive allocation
- Dynamic task distribution

## Communication Protocols

### Message Types
- **Query** - Request information
- **Inform** - Share knowledge
- **Request** - Ask for action
- **Confirm** - Acknowledge completion

### Synchronization
- **Synchronous** - Blocking communication
- **Asynchronous** - Non-blocking messaging
- **Event-driven** - Reactive coordination

## Challenges

1. **Coordination overhead** - Communication costs
2. **Conflict resolution** - Competing goals
3. **Fault tolerance** - Handling agent failures
4. **Load balancing** - Distributing work efficiently`,
    starterCode: `// Multi-Agent Coordination System
class AgentCoordinator {
    constructor() {
        this.agents = new Map();
        this.tasks = [];
        this.results = [];
    }
    
    registerAgent(id, agent) {
        this.agents.set(id, agent);
    }
    
    distributeTask(task) {
        // TODO: Implement task distribution logic
        // Consider agent capabilities and current load
    }
    
    coordinateExecution() {
        // TODO: Implement coordination protocol
        // Handle communication and synchronization
    }
    
    collectResults() {
        // TODO: Gather results from all agents
        // Combine and process the outputs
    }
}

class WorkerAgent {
    constructor(id, capabilities) {
        this.id = id;
        this.capabilities = capabilities;
        this.currentTask = null;
        this.status = 'idle';
    }
    
    canHandle(task) {
        // TODO: Check if agent can handle the task
        return false;
    }
    
    executeTask(task) {
        // TODO: Implement task execution
        this.status = 'working';
        // Simulate work...
        this.status = 'idle';
    }
}

// Create coordinator and agents
const coordinator = new AgentCoordinator();
const agent1 = new WorkerAgent('agent1', ['analysis']);
const agent2 = new WorkerAgent('agent2', ['synthesis']);

coordinator.registerAgent('agent1', agent1);
coordinator.registerAgent('agent2', agent2);`,
    language: "javascript" as const,
    difficulty: "advanced" as const,
    estimatedTime: 30,
    exercise: {
      id: "multi-agent-coordination-exercise",
      title: "Implement Agent Coordination",
      description: "Build a coordination system that distributes tasks based on agent capabilities",
      difficulty: "advanced" as const,
      language: "javascript", 
      xpReward: 250,
      testCases: [
        {
          id: "test-1",
          description: "Should assign tasks to capable agents",
          input: {task: "analysis", agents: ["analysis", "synthesis"]},
          expectedOutput: "agent1"
        },
        {
          id: "test-2",
          description: "Should handle no capable agents",
          input: {task: "unknown", agents: ["analysis", "synthesis"]},
          expectedOutput: null
        }
      ],
      hints: [
        "Match task requirements with agent capabilities",
        "Consider agent availability and current load",
        "Implement proper error handling for unassignable tasks"
      ]
    }
  }
};

export const sampleModules = [
  {
    id: "foundation",
    title: "Foundation",
    description: "Essential concepts for understanding AI agents",
    difficulty: "beginner" as const,
    estimatedHours: 8,
    lessons: [
      "agent-basics-1",
      "prompt-engineering-1"
    ],
    prerequisites: [],
    xpReward: 500
  },
  {
    id: "advanced-coordination", 
    title: "Advanced Coordination",
    description: "Complex multi-agent systems and coordination patterns",
    difficulty: "advanced" as const,
    estimatedHours: 12,
    lessons: [
      "multi-agent-coordination"
    ],
    prerequisites: ["foundation"],
    xpReward: 1000
  }
];

export const sampleAchievements = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "👶",
    requirement: "complete_lesson",
    threshold: 1,
    xpReward: 50
  },
  {
    id: "code-warrior",
    title: "Code Warrior", 
    description: "Complete 5 coding exercises",
    icon: "⚔️",
    requirement: "complete_exercises",
    threshold: 5,
    xpReward: 200
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Get 100% on an exercise",
    icon: "💯", 
    requirement: "perfect_exercise",
    threshold: 1,
    xpReward: 100
  },
  {
    id: "quick-learner",
    title: "Quick Learner",
    description: "Complete a lesson in under 10 minutes",
    icon: "⚡",
    requirement: "fast_completion",
    threshold: 600, // 10 minutes in seconds
    xpReward: 150
  },
  {
    id: "agent-master",
    title: "Agent Master",
    description: "Complete all foundation modules",
    icon: "🎓",
    requirement: "complete_module",
    threshold: 1,
    xpReward: 500
  }
];

export const sampleProgress = {
  userId: "demo-user",
  currentLevel: 1,
  totalXP: 0,
  completedLessons: [],
  completedModules: [],
  achievements: [],
  streakDays: 0,
  totalTimeSpent: 0, // in minutes
  lastActivityDate: new Date().toISOString()
};