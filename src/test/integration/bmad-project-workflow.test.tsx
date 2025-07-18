import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, mockBMadProject } from '@/test/test-utils';
import { BMadProjectList } from '@/components/BMAD/ProjectManager/BMadProjectList';
import { BMadPhase } from '@/types/bmad';

describe('BMAD Project Workflow Integration', () => {
  const mockOnProjectClick = vi.fn();

  const testProjects = [
    mockBMadProject({
      id: 'project-1',
      name: 'E-commerce Platform',
      path: '/projects/ecommerce',
      state: {
        currentPhase: BMadPhase.Planning,
        totalStories: 15,
        completedStories: 3,
        activeStory: 'USER-001',
        agents: {
          analyst: {
            status: 'Active',
            currentTask: 'Requirements analysis',
            lastUpdate: new Date().toISOString(),
          },
          product_owner: {
            status: 'Active',
            currentTask: 'User story definition',
            lastUpdate: new Date().toISOString(),
          },
        },
      },
      communications: [
        { status: 'Pending', content: 'Requirements clarification needed' }
      ],
      lastModified: new Date().toISOString(),
    }),
    mockBMadProject({
      id: 'project-2',
      name: 'Mobile App',
      path: '/projects/mobile',
      state: {
        currentPhase: BMadPhase.Development,
        totalStories: 8,
        completedStories: 6,
        activeStory: 'DEV-003',
        agents: {
          developer: {
            status: 'Active',
            currentTask: 'UI implementation',
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays multiple projects with correct phase information', () => {
    render(
      <BMadProjectList
        projects={testProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    // Verify project names are displayed
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText('Mobile App')).toBeInTheDocument();

    // Verify phase indicators
    expect(screen.getByText('Planning')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();

    // Verify project paths
    expect(screen.getByText('/projects/ecommerce')).toBeInTheDocument();
    expect(screen.getByText('/projects/mobile')).toBeInTheDocument();
  });

  it('shows active stories and agent information', () => {
    render(
      <BMadProjectList
        projects={testProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    // Check active stories
    expect(screen.getByText('USER-001')).toBeInTheDocument();
    expect(screen.getByText('DEV-003')).toBeInTheDocument();

    // Check agent counts (2 active agents for first project, 1 for second)
    expect(screen.getByText('2 agents')).toBeInTheDocument();
    expect(screen.getByText('1 agent')).toBeInTheDocument();
  });

  it('handles project selection workflow', async () => {
    const { user } = render(
      <BMadProjectList
        projects={testProjects}
        onProjectClick={mockOnProjectClick}
        activeProjectId="project-1"
      />
    );

    // Verify active project indicator
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Click on a different project
    const mobileAppCard = screen.getByText('Mobile App').closest('div[class*="cursor-pointer"]');
    if (mobileAppCard) {
      await user.click(mobileAppCard);
      expect(mockOnProjectClick).toHaveBeenCalledWith(testProjects[1]);
    }
  });

  it('displays communication indicators correctly', () => {
    render(
      <BMadProjectList
        projects={testProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    // First project should show 1 pending communication
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows time-based information', () => {
    render(
      <BMadProjectList
        projects={testProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    // Should show "Just now" for recently modified projects
    expect(screen.getAllByText('Just now')).toHaveLength(2);
  });

  it('handles empty state correctly', () => {
    render(
      <BMadProjectList
        projects={[]}
        onProjectClick={mockOnProjectClick}
      />
    );

    expect(screen.getByText('No BMAD projects found')).toBeInTheDocument();
    expect(screen.getByText('Create a new project or discover existing ones to get started.')).toBeInTheDocument();
  });

  it('provides comprehensive project overview', () => {
    render(
      <BMadProjectList
        projects={testProjects}
        onProjectClick={mockOnProjectClick}
      />
    );

    // Verify the integration shows all essential information for project management:
    // 1. Project identification
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    expect(screen.getByText('Mobile App')).toBeInTheDocument();

    // 2. Current phase status
    expect(screen.getByText('Planning')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();

    // 3. Active work indicators
    expect(screen.getByText('USER-001')).toBeInTheDocument();
    expect(screen.getByText('DEV-003')).toBeInTheDocument();

    // 4. Team activity
    expect(screen.getByText('2 agents')).toBeInTheDocument();
    expect(screen.getByText('1 agent')).toBeInTheDocument();

    // 5. Communication status
    expect(screen.getByText('1')).toBeInTheDocument(); // Pending communication badge

    // 6. Recency indicators
    expect(screen.getAllByText('Just now')).toHaveLength(2);
  });
});