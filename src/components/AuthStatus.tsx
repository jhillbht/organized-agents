import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, LogIn, LogOut, User, Key, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AuthStatusData {
  mode: string;
  is_authenticated: boolean;
  username?: string;
  error?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  login_url?: string;
}

export function AuthStatus() {
  const [authStatus, setAuthStatus] = useState<AuthStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const status = await invoke<AuthStatusData>('check_auth_status');
      setAuthStatus(status);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoginInProgress(true);
      setShowLoginDialog(true);
      
      const response = await invoke<LoginResponse>('claude_login');
      
      if (response.login_url) {
        setLoginUrl(response.login_url);
        // Open the login URL in the default browser
        await open(response.login_url);
      }
      
      // Poll for authentication status
      const checkInterval = setInterval(async () => {
        const status = await invoke<AuthStatusData>('check_auth_status');
        if (status.is_authenticated) {
          clearInterval(checkInterval);
          setAuthStatus(status);
          setShowLoginDialog(false);
          setLoginInProgress(false);
        }
      }, 2000);
      
      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        setLoginInProgress(false);
      }, 300000);
      
    } catch (error) {
      console.error('Login failed:', error);
      setLoginInProgress(false);
      setShowLoginDialog(false);
    }
  };

  const handleLogout = async () => {
    try {
      await invoke('claude_logout');
      await checkAuthStatus();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!authStatus) {
    return null;
  }

  const isClaudeMax = authStatus.mode === 'claude-max';
  const isAuthenticated = authStatus.is_authenticated;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Authentication</CardTitle>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isClaudeMax ? "Claude Max" : "API Key"}
            </Badge>
          </div>
          <CardDescription>
            {isClaudeMax 
              ? "Using Claude Max Plan authentication"
              : "Using API key authentication"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Authenticated</span>
              </div>
              
              {authStatus.username && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{authStatus.username}</span>
                </div>
              )}
              
              {isClaudeMax && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {authStatus.error || "Not authenticated"}
                </AlertDescription>
              </Alert>
              
              {isClaudeMax ? (
                <Button
                  onClick={handleLogin}
                  disabled={loginInProgress}
                  className="w-full"
                >
                  {loginInProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login with Claude Max
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>Add your API key to the .env file:</p>
                  <code className="block mt-2 p-2 bg-muted rounded">
                    ANTHROPIC_API_KEY=your_key_here
                  </code>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logging in to Claude Max</DialogTitle>
            <DialogDescription>
              A browser window has been opened for you to login to your Claude Max account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Waiting for authentication...
            </p>
            
            {loginUrl && (
              <div className="text-xs text-center">
                <p className="text-muted-foreground mb-2">
                  If the browser didn't open, visit:
                </p>
                <code className="block p-2 bg-muted rounded break-all">
                  {loginUrl}
                </code>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLoginDialog(false);
                setLoginInProgress(false);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}