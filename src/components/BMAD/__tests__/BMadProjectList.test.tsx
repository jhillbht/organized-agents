import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, mockBMadProject } from '@/test/test-utils';
import { BMadProjectList } from '../ProjectManager/BMadProjectList';
import { BMadPhase } from '@/types/bmad';

describe('BMadProjectList', () => {
  const mockOnProjectClick = vi.fn();

  const defaultProjects = [
    mockBMadProject({
      id: 'project-1',
      name: 'Test Project 1',
      path: '/path/to/project1',
      state: {
        currentPhase: BMadPhase.Development,
        phaseStartedAt: new Date().toISOString(),
        totalStories: 10,
        completedStories: 4,
        activeStory: 'STORY-001',
        agents: {
          developer: {
            status: 'Active',
            currentTask: 'Implementing feature',
            lastUpdate: new Date().toISOString(),
          },
          qa_engineer: {
            status: 'Waiting',
            currentTask: null,
            lastUpdate: new Date().toISOString(),
          },
        },
      },
      communications: [],
      lastModified: new Date().toISOString(),
    }),
    mockBMadProject({
      id: 'project-2',
      name: 'Test Project 2',
      path: '/path/to/project2',
      state: {
        currentPhase: BMadPhase.Planning,
        phaseStartedAt: new Date().toISOString(),
        totalStories: 5,
        completedStories: 1,
        activeStory: 'STORY-002',
        agents: {},
      },
      communications: [{ status: 'Pending' }],
      lastModified: new Date().toISOString(),
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays project list correctly', () => {
    render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    expect(screen.getByText('/path/to/project1')).toBeInTheDocument();
    expect(screen.getByText('/path/to/project2')).toBeInTheDocument();
  });

  it('shows current phase badges', () => {
    render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  it('handles project clicks', async () => {
    const { user } = render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    const projectCard = screen.getByText('Test Project 1').closest('[role="button"]') || 
                       screen.getByText('Test Project 1').closest('div[class*="cursor-pointer"]');
    
    if (projectCard) {
      await user.click(projectCard);
      expect(mockOnProjectClick).toHaveBeenCalledWith(defaultProjects[0]);
    }
  });

  it('shows active story information', () => {
    render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getByText('STORY-001')).toBeInTheDocument();
    expect(screen.getByText('STORY-002')).toBeInTheDocument();
  });

  it('displays agent count for active agents', () => {
    render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getByText('1 agent')).toBeInTheDocument();
  });

  it('shows unread message indicators', () => {
    render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Badge for pending communication
  });

  it('highlights active project', () => {
    render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
        activeProjectId="project-1"
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows empty state when no projects', () => {
    render(
      <BMadProjectList
        projects={[]}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getByText('No BMAD projects found')).toBeInTheDocument();
    expect(screen.getByText('Create a new project or discover existing ones to get started.')).toBeInTheDocument();
  });

  it('displays last modified time', () => {
    render(
      <BMadProjectList
        projects={defaultProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getAllByText('Just now')).toHaveLength(2); // One for each project
  });
});