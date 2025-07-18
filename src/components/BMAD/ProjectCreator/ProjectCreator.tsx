import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  FolderOpen,
  Settings,
  Users,
  Target,
  FileText,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { BMadAPI, handleBMadError } from "@/lib/bmad-api";
import { 
  BMadProject,
  ProjectSettings,
  QualityGates,
  NotificationSettings,
  AgentType 
} from "@/types/bmad";

interface ProjectCreatorProps {
  onProjectCreated?: (project: BMadProject) => void;
  onCancel?: () => void;
  className?: string;
}

interface ProjectCreationData {
  name: string;
  path: string;
  description: string;
  projectType: 'web' | 'mobile' | 'desktop' | 'api' | 'library' | 'other';
  idePreference: string;
  autoTriggerAgents: boolean;
  qualityGates: QualityGates;
  notificationSettings: NotificationSettings;
  initialAgents: AgentType[];
}

const WIZARD_STEPS = [
  { id: 'basic', title: 'Basic Information', icon: FileText },
  { id: 'location', title: 'Project Location', icon: FolderOpen },
  { id: 'agents', title: 'Agent Configuration', icon: Users },
  { id: 'settings', title: 'Project Settings', icon: Settings },
  { id: 'review', title: 'Review & Create', icon: Check },
];

const PROJECT_TYPES = [
  { value: 'web', label: 'Web Application', description: 'Frontend, backend, or full-stack web projects' },
  { value: 'mobile', label: 'Mobile App', description: 'iOS, Android, or cross-platform mobile applications' },
  { value: 'desktop', label: 'Desktop Application', description: 'Native desktop applications' },
  { value: 'api', label: 'API Service', description: 'Backend APIs and microservices' },
  { value: 'library', label: 'Library/Package', description: 'Reusable code libraries and packages' },
  { value: 'other', label: 'Other', description: 'Custom or specialized project types' },
];

const DEFAULT_IDES = [
  'Visual Studio Code',
  'IntelliJ IDEA',
  'WebStorm',
  'PyCharm',
  'Sublime Text',
  'Atom',
  'Vim',
  'Emacs',
];

/**
 * ProjectCreator component - Multi-step wizard for creating new BMAD projects
 */
export const ProjectCreator: React.FC<ProjectCreatorProps> = ({
  onProjectCreated,
  onCancel,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableIdes, setAvailableIdes] = useState<string[]>([]);
  const [projectData, setProjectData] = useState<ProjectCreationData>({
    name: '',
    path: '',
    description: '',
    projectType: 'web',
    idePreference: '',
    autoTriggerAgents: true,
    qualityGates: {
      requireTests: true,
      requireDocumentation: false,
      requireArchitectureApproval: true,
      requireSecurityReview: false,
    },
    notificationSettings: {
      desktopNotifications: true,
      agentHandoffs: true,
      storyCompletions: true,
      blockers: true,
    },
    initialAgents: [
      AgentType.Analyst,
      AgentType.Architect,
      AgentType.ProductManager,
      AgentType.Developer,
    ],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableIdes();
  }, []);

  const loadAvailableIdes = async () => {
    try {
      const ides = await BMadAPI.detectInstalledIdes();
      setAvailableIdes(ides);
      if (ides.length > 0 && !projectData.idePreference) {
        setProjectData(prev => ({ ...prev, idePreference: ides[0] }));
      }
    } catch (error) {
      console.error('Failed to detect IDEs:', error);
      setAvailableIdes(DEFAULT_IDES);
    }
  };

  const updateProjectData = (updates: Partial<ProjectCreationData>) => {
    setProjectData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Information
        return !!(projectData.name.trim() && projectData.description.trim());
      case 1: // Project Location
        return !!(projectData.path.trim());
      case 2: // Agent Configuration
        return projectData.initialAgents.length > 0;
      case 3: // Project Settings
        return !!(projectData.idePreference);
      case 4: // Review & Create
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1 && validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const createProject = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      
      // Create the project
      const project = await BMadAPI.createProject(projectData.name, projectData.path);
      
      // TODO: Additional project setup would go here
      // - Apply project settings
      // - Initialize agents
      // - Set up quality gates
      // - Configure notifications
      
      onProjectCreated?.(project);
      
      toast({
        title: "Project Created",
        description: `${projectData.name} has been successfully created`,
      });
    } catch (error) {
      const bmadError = handleBMadError(error);
      toast({
        title: "Creation Failed",
        description: bmadError.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = (): number => {
    return ((currentStep + 1) / WIZARD_STEPS.length) * 100;
  };

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="project-name">Project Name *</Label>
        <Input
          id="project-name"
          value={projectData.name}
          onChange={(e) => updateProjectData({ name: e.target.value })}
          placeholder="Enter project name"
          className="mt-2"
        />
      </div>
      
      <div>
        <Label htmlFor="project-description">Description *</Label>
        <Textarea
          id="project-description"
          value={projectData.description}
          onChange={(e) => updateProjectData({ description: e.target.value })}
          placeholder="Describe your project goals and requirements"
          rows={3}
          className="mt-2"
        />
      </div>
      
      <div>
        <Label>Project Type</Label>
        <RadioGroup
          value={projectData.projectType}
          onValueChange={(value) => updateProjectData({ projectType: value as any })}
          className="mt-2"
        >
          {PROJECT_TYPES.map((type) => (
            <div key={type.value} className="flex items-start space-x-2">
              <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={type.value} className="font-medium cursor-pointer">
                  {type.label}
                </Label>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );

  const renderProjectLocation = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="project-path">Project Directory *</Label>
        <div className="flex space-x-2 mt-2">
          <Input
            id="project-path"
            value={projectData.path}
            onChange={(e) => updateProjectData({ path: e.target.value })}
            placeholder="/path/to/your/project"
          />
          <Button variant="outline" onClick={() => {
            // In a real implementation, this would open a folder picker
            toast({
              title: "Folder Picker",
              description: "This would open a native folder picker dialog",
            });
          }}>
            <FolderOpen className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Choose an empty directory or create a new one for your project
        </p>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">What will be created:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• .bmad/ directory for project coordination</li>
          <li>• state.yaml for workflow tracking</li>
          <li>• communications/ folder for agent messages</li>
          <li>• stories/ directory for development stories</li>
          <li>• Initial project structure based on type</li>
        </ul>
      </div>
    </div>
  );

  const renderAgentConfiguration = () => (
    <div className="space-y-6">
      <div>
        <Label>Initial Agents</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select which agents should be available for this project
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(AgentType).filter(agent => agent !== AgentType.BMadOrchestrator).map((agent) => (
            <div key={agent} className="flex items-center space-x-2">
              <Checkbox
                id={agent}
                checked={projectData.initialAgents.includes(agent)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateProjectData({
                      initialAgents: [...projectData.initialAgents, agent]
                    });
                  } else {
                    updateProjectData({
                      initialAgents: projectData.initialAgents.filter(a => a !== agent)
                    });
                  }
                }}
              />
              <Label htmlFor={agent} className="cursor-pointer">
                {agent.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Agent Recommendations</h4>
            <p className="text-sm text-blue-700 mt-1">
              Based on your project type ({PROJECT_TYPES.find(t => t.value === projectData.projectType)?.label}), 
              we recommend starting with {projectData.initialAgents.length} agents. You can always add more later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectSettings = () => (
    <div className="space-y-6">
      <div>
        <Label>Preferred IDE</Label>
        <Select
          value={projectData.idePreference}
          onValueChange={(value) => updateProjectData({ idePreference: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select your IDE" />
          </SelectTrigger>
          <SelectContent>
            {availableIdes.map((ide) => (
              <SelectItem key={ide} value={ide}>
                {ide}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <Label>Auto-trigger Agents</Label>
          <p className="text-sm text-muted-foreground">
            Automatically dispatch agents when conditions are met
          </p>
        </div>
        <Switch
          checked={projectData.autoTriggerAgents}
          onCheckedChange={(checked) => updateProjectData({ autoTriggerAgents: checked })}
        />
      </div>
      
      <div>
        <Label className="text-base font-medium">Quality Gates</Label>
        <div className="space-y-3 mt-3">
          {Object.entries(projectData.qualityGates).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updateProjectData({
                  qualityGates: { ...projectData.qualityGates, [key]: checked }
                })}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-base font-medium">Notifications</Label>
        <div className="space-y-3 mt-3">
          {Object.entries(projectData.notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updateProjectData({
                  notificationSettings: { ...projectData.notificationSettings, [key]: checked }
                })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{projectData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {PROJECT_TYPES.find(t => t.value === projectData.projectType)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium font-mono text-sm">{projectData.path}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IDE:</span>
              <span className="font-medium">{projectData.idePreference}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Agents ({projectData.initialAgents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {projectData.initialAgents.map((agent) => (
                <Badge key={agent} variant="secondary">
                  {agent.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-trigger agents:</span>
              <Badge variant={projectData.autoTriggerAgents ? "default" : "secondary"}>
                {projectData.autoTriggerAgents ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality gates:</span>
              <span className="font-medium">
                {Object.values(projectData.qualityGates).filter(Boolean).length} enabled
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notifications:</span>
              <span className="font-medium">
                {Object.values(projectData.notificationSettings).filter(Boolean).length} enabled
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Check className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Ready to Create</h4>
            <p className="text-sm text-green-700 mt-1">
              Your BMAD project is configured and ready to be created. Click "Create Project" to set up 
              the project structure and initialize the workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicInformation();
      case 1: return renderProjectLocation();
      case 2: return renderAgentConfiguration();
      case 3: return renderProjectSettings();
      case 4: return renderReview();
      default: return null;
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create New BMAD Project</h1>
        <p className="text-muted-foreground">
          Set up a new project with the Breakthrough Method for Agile AI-Driven Development
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-green-500 bg-green-500 text-white",
                      !isActive && !isCompleted && "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-2 transition-colors",
                        isCompleted ? "bg-green-500" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep + 1} of {WIZARD_STEPS.length}</span>
            <span>{Math.round(getStepProgress())}% complete</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "h-5 w-5" })}
            <span>{WIZARD_STEPS[currentStep].title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : prevStep}
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        <Button
          onClick={currentStep === WIZARD_STEPS.length - 1 ? createProject : nextStep}
          disabled={!validateStep(currentStep) || loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : currentStep === WIZARD_STEPS.length - 1 ? (
            <FolderPlus className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          {currentStep === WIZARD_STEPS.length - 1 ? 'Create Project' : 'Next'}
        </Button>
      </div>
    </div>
  );
};