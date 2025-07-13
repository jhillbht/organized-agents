// Session Converter - Transform existing education sessions to Academy format

import { sampleLessons, sampleModules } from '../data/sampleLessons';

interface LegacySession {
  id: string;
  title: string;
  content: string;
  objectives?: string[];
  exercises?: any[];
  difficulty?: string;
  estimatedTime?: number;
}

interface AcademyLesson {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  theory: string;
  starterCode: string;
  language: 'javascript' | 'typescript' | 'python' | 'rust';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercise: AcademyExercise;
  estimatedTime: number;
  prerequisites?: string[];
}

interface AcademyExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  testCases: TestCase[];
  hints?: string[];
  timeLimit?: number;
  xpReward: number;
}

interface TestCase {
  id: string;
  description: string;
  input: any;
  expectedOutput: any;
  hidden?: boolean;
  weight?: number;
}

export class SessionConverter {
  /**
   * Convert legacy education sessions to Academy lesson format
   */
  static convertSessionsToLessons(legacySessions: LegacySession[]): AcademyLesson[] {
    return legacySessions.map(session => this.convertSingleSession(session));
  }

  /**
   * Convert a single legacy session to Academy lesson format
   */
  static convertSingleSession(session: LegacySession): AcademyLesson {
    const difficulty = this.normalizeDifficulty(session.difficulty);
    const language = this.detectLanguage(session.content);
    
    return {
      id: session.id,
      title: session.title,
      description: this.extractDescription(session.content),
      learningObjectives: session.objectives || this.extractObjectives(session.content),
      theory: this.extractTheory(session.content),
      starterCode: this.extractStarterCode(session.content),
      language,
      difficulty,
      estimatedTime: session.estimatedTime || this.estimateTime(session.content),
      exercise: this.createExerciseFromSession(session, difficulty, language),
      prerequisites: this.extractPrerequisites(session.content)
    };
  }

  /**
   * Create Academy exercise from legacy session
   */
  private static createExerciseFromSession(
    session: LegacySession, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    language: string
  ): AcademyExercise {
    const xpReward = this.calculateXPReward(difficulty, session.estimatedTime || 15);
    
    return {
      id: `${session.id}-exercise`,
      title: `${session.title} - Practice`,
      description: this.extractExerciseDescription(session.content),
      difficulty,
      language,
      testCases: this.generateTestCases(session),
      hints: this.extractHints(session.content),
      timeLimit: this.calculateTimeLimit(difficulty),
      xpReward
    };
  }

  /**
   * Generate test cases from session content
   */
  private static generateTestCases(session: LegacySession): TestCase[] {
    // Check if session has existing exercises
    if (session.exercises && session.exercises.length > 0) {
      return session.exercises.map((exercise, index) => ({
        id: `test-${index + 1}`,
        description: exercise.description || `Test case ${index + 1}`,
        input: exercise.input || `input_${index + 1}`,
        expectedOutput: exercise.expectedOutput || `output_${index + 1}`,
        hidden: exercise.hidden || false,
        weight: exercise.weight || 1
      }));
    }

    // Generate basic test cases based on content
    return this.generateBasicTestCases(session);
  }

  /**
   * Generate basic test cases when none exist
   */
  private static generateBasicTestCases(session: LegacySession): TestCase[] {
    const difficulty = this.normalizeDifficulty(session.difficulty);
    
    switch (difficulty) {
      case 'beginner':
        return [
          {
            id: 'test-1',
            description: 'Basic functionality test',
            input: 'basic_input',
            expectedOutput: 'basic_output'
          },
          {
            id: 'test-2',
            description: 'Edge case test',
            input: 'edge_input',
            expectedOutput: 'edge_output'
          }
        ];
      
      case 'intermediate':
        return [
          {
            id: 'test-1',
            description: 'Standard use case',
            input: 'standard_input',
            expectedOutput: 'standard_output'
          },
          {
            id: 'test-2',
            description: 'Complex scenario',
            input: 'complex_input',
            expectedOutput: 'complex_output'
          },
          {
            id: 'test-3',
            description: 'Error handling',
            input: 'error_input',
            expectedOutput: 'error_output'
          }
        ];
      
      case 'advanced':
        return [
          {
            id: 'test-1',
            description: 'Performance test',
            input: 'large_input',
            expectedOutput: 'large_output'
          },
          {
            id: 'test-2',
            description: 'Algorithm validation',
            input: 'algorithm_input',
            expectedOutput: 'algorithm_output'
          },
          {
            id: 'test-3',
            description: 'Edge case handling',
            input: 'edge_input',
            expectedOutput: 'edge_output'
          },
          {
            id: 'test-4',
            description: 'Integration test',
            input: 'integration_input',
            expectedOutput: 'integration_output',
            hidden: true
          }
        ];
      
      default:
        return [];
    }
  }

  /**
   * Extract description from session content
   */
  private static extractDescription(content: string): string {
    const lines = content.split('\n');
    const descriptionLine = lines.find(line => 
      line.toLowerCase().includes('description') ||
      line.toLowerCase().includes('overview') ||
      line.toLowerCase().includes('introduction')
    );
    
    if (descriptionLine) {
      return descriptionLine.replace(/^[#*\-\s]*description[:\s]*/i, '').trim();
    }
    
    // Fallback: use first meaningful line
    const meaningfulLine = lines.find(line => 
      line.length > 20 && !line.startsWith('#') && !line.startsWith('//') 
    );
    
    return meaningfulLine?.substring(0, 150) + '...' || 'Educational content on programming concepts.';
  }

  /**
   * Extract learning objectives from content
   */
  private static extractObjectives(content: string): string[] {
    const objectivePatterns = [
      /objectives?[:\s]*\n((?:[\s]*[-*•]\s*.+\n?)+)/i,
      /goals?[:\s]*\n((?:[\s]*[-*•]\s*.+\n?)+)/i,
      /learn[:\s]*\n((?:[\s]*[-*•]\s*.+\n?)+)/i
    ];

    for (const pattern of objectivePatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1]
          .split('\n')
          .map(line => line.replace(/^[\s*•-]+/, '').trim())
          .filter(line => line.length > 0);
      }
    }

    // Default objectives based on content analysis
    return [
      'Understand the core concepts presented',
      'Apply the knowledge in practical scenarios',
      'Complete hands-on exercises successfully'
    ];
  }

  /**
   * Extract theory content from session
   */
  private static extractTheory(content: string): string {
    // Remove code blocks and keep theory content
    const theoryContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .trim();

    return theoryContent || 'This lesson covers important programming concepts and best practices.';
  }

  /**
   * Extract starter code from session content
   */
  private static extractStarterCode(content: string): string {
    const codeBlockMatch = content.match(/```(?:javascript|typescript|python|rust)?\n([\s\S]*?)```/);
    
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Look for inline code snippets
    const inlineCodeMatch = content.match(/`([^`]+)`/);
    if (inlineCodeMatch && inlineCodeMatch[1].length > 20) {
      return inlineCodeMatch[1];
    }

    // Default starter code based on detected language
    const language = this.detectLanguage(content);
    return this.getDefaultStarterCode(language);
  }

  /**
   * Get default starter code for language
   */
  private static getDefaultStarterCode(language: string): string {
    switch (language) {
      case 'javascript':
        return '// Your code here\nfunction solution() {\n    // TODO: Implement your solution\n    return null;\n}';
      
      case 'typescript':
        return '// Your TypeScript code here\nfunction solution(): any {\n    // TODO: Implement your solution\n    return null;\n}';
      
      case 'python':
        return '# Your Python code here\ndef solution():\n    # TODO: Implement your solution\n    pass';
      
      case 'rust':
        return '// Your Rust code here\nfn solution() -> Option<i32> {\n    // TODO: Implement your solution\n    None\n}';
      
      default:
        return '// Your code here\nfunction solution() {\n    // TODO: Implement your solution\n    return null;\n}';
    }
  }

  /**
   * Detect programming language from content
   */
  private static detectLanguage(content: string): 'javascript' | 'typescript' | 'python' | 'rust' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('typescript') || lowerContent.includes('.ts')) return 'typescript';
    if (lowerContent.includes('python') || lowerContent.includes('def ') || lowerContent.includes('.py')) return 'python';
    if (lowerContent.includes('rust') || lowerContent.includes('fn ') || lowerContent.includes('.rs')) return 'rust';
    
    // Default to JavaScript
    return 'javascript';
  }

  /**
   * Normalize difficulty level
   */
  private static normalizeDifficulty(difficulty?: string): 'beginner' | 'intermediate' | 'advanced' {
    if (!difficulty) return 'beginner';
    
    const lower = difficulty.toLowerCase();
    if (lower.includes('advanced') || lower.includes('expert') || lower.includes('hard')) return 'advanced';
    if (lower.includes('intermediate') || lower.includes('medium')) return 'intermediate';
    return 'beginner';
  }

  /**
   * Estimate lesson time based on content
   */
  private static estimateTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    
    // Base time: 2 minutes per 100 words
    let estimatedTime = Math.ceil(wordCount / 100) * 2;
    
    // Add time for code blocks: 5 minutes each
    estimatedTime += codeBlocks * 5;
    
    // Minimum 10 minutes, maximum 60 minutes
    return Math.max(10, Math.min(60, estimatedTime));
  }

  /**
   * Calculate XP reward based on difficulty and time
   */
  private static calculateXPReward(difficulty: string, estimatedTime: number): number {
    const baseXP = estimatedTime * 5; // 5 XP per minute
    
    switch (difficulty) {
      case 'beginner': return Math.round(baseXP * 1.0);
      case 'intermediate': return Math.round(baseXP * 1.5);
      case 'advanced': return Math.round(baseXP * 2.0);
      default: return Math.round(baseXP);
    }
  }

  /**
   * Calculate time limit for exercises
   */
  private static calculateTimeLimit(difficulty: string): number {
    switch (difficulty) {
      case 'beginner': return 900; // 15 minutes
      case 'intermediate': return 1800; // 30 minutes  
      case 'advanced': return 3600; // 60 minutes
      default: return 1200; // 20 minutes
    }
  }

  /**
   * Extract exercise description from content
   */
  private static extractExerciseDescription(content: string): string {
    const exerciseMatch = content.match(/exercise[:\s]*([^\n]+)/i);
    if (exerciseMatch) {
      return exerciseMatch[1].trim();
    }
    
    return 'Complete the coding exercise by implementing the required functionality.';
  }

  /**
   * Extract hints from content
   */
  private static extractHints(content: string): string[] {
    const hintsMatch = content.match(/hints?[:\s]*\n((?:[\s]*[-*•]\s*.+\n?)+)/i);
    
    if (hintsMatch) {
      return hintsMatch[1]
        .split('\n')
        .map(line => line.replace(/^[\s*•-]+/, '').trim())
        .filter(line => line.length > 0);
    }
    
    return [
      'Break down the problem into smaller steps',
      'Consider edge cases and error handling',
      'Test your solution with different inputs'
    ];
  }

  /**
   * Extract prerequisites from content
   */
  private static extractPrerequisites(content: string): string[] {
    const prereqMatch = content.match(/prerequisites?[:\s]*\n((?:[\s]*[-*•]\s*.+\n?)+)/i);
    
    if (prereqMatch) {
      return prereqMatch[1]
        .split('\n')
        .map(line => line.replace(/^[\s*•-]+/, '').trim())
        .filter(line => line.length > 0);
    }
    
    return [];
  }

  /**
   * Convert all sessions and create module structure
   */
  static createAcademyStructure(legacySessions: LegacySession[]) {
    const lessons = this.convertSessionsToLessons(legacySessions);
    
    // Group lessons by difficulty
    const beginnerLessons = lessons.filter(l => l.difficulty === 'beginner');
    const intermediateLessons = lessons.filter(l => l.difficulty === 'intermediate'); 
    const advancedLessons = lessons.filter(l => l.difficulty === 'advanced');

    const modules = [];
    
    if (beginnerLessons.length > 0) {
      modules.push({
        id: 'converted-foundation',
        title: 'Converted Foundation Lessons',
        description: 'Essential concepts converted from existing sessions',
        difficulty: 'beginner' as const,
        estimatedHours: beginnerLessons.reduce((sum, lesson) => sum + (lesson.estimatedTime / 60), 0),
        lessons: beginnerLessons.map(l => l.id),
        prerequisites: [],
        xpReward: beginnerLessons.reduce((sum, lesson) => sum + lesson.exercise.xpReward, 0)
      });
    }

    if (intermediateLessons.length > 0) {
      modules.push({
        id: 'converted-intermediate',
        title: 'Converted Intermediate Lessons', 
        description: 'Advanced topics converted from existing sessions',
        difficulty: 'intermediate' as const,
        estimatedHours: intermediateLessons.reduce((sum, lesson) => sum + (lesson.estimatedTime / 60), 0),
        lessons: intermediateLessons.map(l => l.id),
        prerequisites: beginnerLessons.length > 0 ? ['converted-foundation'] : [],
        xpReward: intermediateLessons.reduce((sum, lesson) => sum + lesson.exercise.xpReward, 0)
      });
    }

    if (advancedLessons.length > 0) {
      modules.push({
        id: 'converted-advanced',
        title: 'Converted Advanced Lessons',
        description: 'Expert-level topics converted from existing sessions', 
        difficulty: 'advanced' as const,
        estimatedHours: advancedLessons.reduce((sum, lesson) => sum + (lesson.estimatedTime / 60), 0),
        lessons: advancedLessons.map(l => l.id),
        prerequisites: ['converted-foundation', 'converted-intermediate'].filter(p => 
          modules.some(m => m.id === p)
        ),
        xpReward: advancedLessons.reduce((sum, lesson) => sum + lesson.exercise.xpReward, 0)
      });
    }

    return {
      lessons,
      modules,
      totalLessons: lessons.length,
      totalXP: lessons.reduce((sum, lesson) => sum + lesson.exercise.xpReward, 0)
    };
  }
}