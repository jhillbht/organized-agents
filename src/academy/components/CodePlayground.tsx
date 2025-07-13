import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Copy, 
  Download,
  Upload,
  Settings,
  Maximize2,
  Minimize2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Monaco Editor types (simplified for this implementation)
interface MonacoEditor {
  setValue: (value: string) => void;
  getValue: () => string;
  dispose: () => void;
}

interface CodePlaygroundProps {
  initialCode?: string;
  language?: 'javascript' | 'typescript' | 'python' | 'rust' | 'bash';
  theme?: 'vs-dark' | 'vs-light';
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  onExecute?: (code: string) => Promise<ExecutionResult>;
  className?: string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

/**
 * Advanced code playground with Monaco editor integration
 * Features syntax highlighting, code execution, testing, and more
 */
export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = '',
  language = 'javascript',
  theme = 'vs-dark',
  readOnly = false,
  onCodeChange,
  onExecute,
  className
}) => {
  const [code, setCode] = useState(initialCode);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorTheme, setEditorTheme] = useState(theme);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'output' | 'tests'>('code');
  
  const editorRef = useRef<MonacoEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Monaco editor (placeholder for actual Monaco integration)
  useEffect(() => {
    if (editorContainerRef.current) {
      // In a real implementation, this would initialize Monaco editor
      // For now, we'll use a textarea as placeholder
      console.log('Monaco editor would be initialized here');
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleExecute = async () => {
    if (!onExecute) return;

    setIsExecuting(true);
    setActiveTab('output');
    
    try {
      const result = await onExecute(code);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setExecutionResult(null);
    setActiveTab('code');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    const extension = language === 'javascript' ? 'js' : 
                    language === 'typescript' ? 'ts' :
                    language === 'python' ? 'py' :
                    language === 'rust' ? 'rs' : 'txt';
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.ts,.py,.rs,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setCode(content);
          handleCodeChange(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const runTests = async () => {
    if (!onExecute || testCases.length === 0) return;

    setActiveTab('tests');
    setIsExecuting(true);

    const results = [];
    for (const testCase of testCases) {
      try {
        // Create test code that includes the test case input
        const testCode = `${code}\n\n// Test case: ${testCase.description}\nconsole.log(${testCase.input});`;
        const result = await onExecute(testCode);
        results.push({
          ...testCase,
          passed: result.output.trim() === testCase.expectedOutput.trim(),
          actualOutput: result.output
        });
      } catch (error) {
        results.push({
          ...testCase,
          passed: false,
          actualOutput: error instanceof Error ? error.message : 'Error'
        });
      }
    }

    setIsExecuting(false);
    // In a real implementation, we'd store and display test results
    console.log('Test results:', results);
  };

  return (
    <div className={cn(
      "flex flex-col bg-background border rounded-lg overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 rounded-none",
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {language.toUpperCase()}
          </Badge>
          <div className="text-sm font-medium">Code Playground</div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting || readOnly || !onExecute}
            className="gap-2"
          >
            {isExecuting ? (
              <>
                <Square className="h-3 w-3" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Run
              </>
            )}
          </Button>
          
          {testCases.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={runTests}
              disabled={isExecuting || readOnly}
              className="gap-2"
            >
              <CheckCircle className="h-3 w-3" />
              Test
            </Button>
          )}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={readOnly}
            className="gap-2"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpload}
            disabled={readOnly}
            className="gap-2"
          >
            <Upload className="h-3 w-3" />
          </Button>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('code')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'code' 
              ? "border-primary text-primary" 
              : "border-transparent hover:text-foreground"
          )}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'output' 
              ? "border-primary text-primary" 
              : "border-transparent hover:text-foreground"
          )}
        >
          Output
          {executionResult && (
            <Badge 
              variant="outline" 
              className={cn(
                "ml-2 text-xs",
                executionResult.success ? "text-green-600" : "text-red-600"
              )}
            >
              {executionResult.success ? "✓" : "✗"}
            </Badge>
          )}
        </button>
        {testCases.length > 0 && (
          <button
            onClick={() => setActiveTab('tests')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'tests' 
                ? "border-primary text-primary" 
                : "border-transparent hover:text-foreground"
            )}
          >
            Tests ({testCases.length})
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {activeTab === 'code' && (
          <div className="h-full">
            {/* Monaco Editor Container - In real implementation, Monaco would be here */}
            <div 
              ref={editorContainerRef}
              className="h-full"
              style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : '400px' }}
            >
              {/* Placeholder textarea for now - replace with actual Monaco editor */}
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                readOnly={readOnly}
                className={cn(
                  "w-full h-full p-4 font-mono text-sm resize-none border-none outline-none",
                  editorTheme === 'vs-dark' 
                    ? "bg-gray-900 text-gray-100" 
                    : "bg-white text-gray-900"
                )}
                style={{ fontSize: `${fontSize}px` }}
                placeholder={`// Start coding in ${language}...`}
              />
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="h-full p-4 overflow-auto">
            {isExecuting ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Executing code...
              </div>
            ) : executionResult ? (
              <div className="space-y-4">
                {/* Execution Status */}
                <div className="flex items-center gap-2">
                  {executionResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    executionResult.success ? "text-green-600" : "text-red-600"
                  )}>
                    {executionResult.success ? "Execution completed" : "Execution failed"}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {executionResult.executionTime}ms
                  </div>
                </div>

                {/* Output */}
                {executionResult.output && (
                  <div>
                    <div className="text-sm font-medium mb-2">Output:</div>
                    <pre className="p-3 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap">
                      {executionResult.output}
                    </pre>
                  </div>
                )}

                {/* Error */}
                {executionResult.error && (
                  <div>
                    <div className="text-sm font-medium mb-2 text-red-600">Error:</div>
                    <pre className="p-3 bg-red-50 border border-red-200 rounded-md text-sm font-mono text-red-700 whitespace-pre-wrap">
                      {executionResult.error}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Click "Run" to execute your code</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="h-full p-4 overflow-auto">
            {testCases.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No test cases available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {testCases.map((testCase, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{testCase.description}</div>
                        <Badge variant="outline" className="text-xs">
                          Test {index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Input:</div>
                        <code className="block p-2 bg-muted rounded text-xs font-mono">
                          {testCase.input}
                        </code>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Expected Output:</div>
                        <code className="block p-2 bg-muted rounded text-xs font-mono">
                          {testCase.expectedOutput}
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};