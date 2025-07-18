import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Custom render function that includes common providers
export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  };
}

// Mock data generators
export const mockBMadProject = (overrides = {}) => ({
  id: 'test-project-1',
  name: 'Test Project',
  description: 'A test BMAD project',
  type: 'web_app' as const,
  path: '/test/project',
  createdAt: new Date().toISOString(),
  state: {
    currentPhase: 'planning' as const,
    phaseStartedAt: new Date().toISOString(),
    totalStories: 10,
    completedStories: 3,
    activeStory: 'STORY-001',
    agents: {
      developer: {
        status: 'active' as const,
        currentTask: 'Implementing feature',
        lastUpdate: new Date().toISOString(),
      },
    },
  },
  ...overrides,
});

export const mockBMadLesson = (overrides = {}) => ({
  id: 'test-lesson-1',
  title: 'Test Lesson',
  description: 'A test BMAD lesson',
  phase: 'general' as const,
  content: {
    introduction: 'Test introduction',
    sections: [
      {
        title: 'Test Section',
        content: 'Test content',
        type: 'text' as const,
      },
    ],
    summary: 'Test summary',
    keyTakeaways: ['Test takeaway'],
    additionalResources: [],
  },
  exercises: [],
  prerequisites: [],
  realProjectIntegration: false,
  estimatedDuration: 30,
  difficulty: 'beginner' as const,
  tags: ['test'],
  order_index: 1,
  ...overrides,
});

export const mockAgentRecommendation = (overrides = {}) => ({
  agent: 'developer' as const,
  priority: 8,
  reason: 'Feature implementation needed',
  prerequisites: [],
  estimatedTime: '2 hours',
  ...overrides,
});

// Mock Tauri API responses
export const mockTauriInvoke = async (command: string, response: any) => {
  const { invoke } = await import('@tauri-apps/api/core');
  const mockedInvoke = vi.mocked(invoke);
  mockedInvoke.mockImplementation((cmd: string) => {
    if (cmd === command) {
      return Promise.resolve(response);
    }
    return Promise.reject(new Error(`Unknown command: ${cmd}`));
  });
};

// Wait for async updates
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render, userEvent };