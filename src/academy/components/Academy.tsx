import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { academyApi, academyUtils } from '../api';
import { ModuleBrowser } from './ModuleBrowser';
import { LessonViewer } from './LessonViewer';
import { ProgressDashboard } from './ProgressDashboard';
import { AchievementGallery } from './AchievementGallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Sparkles, 
  ArrowLeft,
  User,
  Star,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import type { LearningModule, Lesson, UserStats } from '../types';

interface AcademyProps {
  onBack?: () => void;
  className?: string;
}

export function Academy({ onBack, className }: AcademyProps) {
  const [activeTab, setActiveTab] = useState('modules');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(() => academyUtils.generateUserId());

  useEffect(() => {
    initializeAcademy();
  }, []);

  const initializeAcademy = async () => {
    try {
      setLoading(true);
      
      // Initialize the academy system
      await academyApi.initializeSystem();
      
      // Load modules and user stats
      const [modulesData, statsData] = await Promise.all([
        academyApi.getModules(),
        academyApi.getUserStats(userId),
      ]);
      
      setModules(modulesData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Failed to initialize academy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module: LearningModule) => {
    setSelectedModule(module);
    setActiveTab('lessons');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('lesson');
  };

  const handleLessonComplete = async () => {
    // Refresh user stats after lesson completion
    try {
      const newStats = await academyApi.getUserStats(userId);
      setUserStats(newStats);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setSelectedLesson(null);
    setActiveTab('modules');
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setActiveTab('lessons');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agent Journey Academy
              </h1>
              <p className="text-gray-600 mt-1">Master the art of AI agent development</p>
            </div>
          </div>
          
          {userStats && (
            <div className="flex items-center gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-medium">Level {userStats.level}</div>
                    <div className="text-xs text-gray-500">{userStats.experience} XP</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <div className="text-sm">
                    <div className="font-medium">{userStats.totalLessonsCompleted} Lessons</div>
                    <div className="text-xs text-gray-500">{userStats.achievementsUnlocked} Achievements</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Breadcrumbs */}
      {(selectedModule || selectedLesson) && (
        <div className="border-b p-4 bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToModules}
              className="text-blue-600"
            >
              Academy
            </Button>
            {selectedModule && (
              <>
                <span className="text-gray-400">/</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectedLesson ? handleBackToLessons : undefined}
                  className={selectedLesson ? "text-blue-600" : "text-gray-700"}
                >
                  {selectedModule.name}
                </Button>
              </>
            )}
            {selectedLesson && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700">{selectedLesson.title}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedLesson ? (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <LessonViewer
                lesson={selectedLesson}
                userId={userId}
                onComplete={handleLessonComplete}
                onBack={handleBackToLessons}
              />
            </motion.div>
          ) : selectedModule ? (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ModuleBrowser
                module={selectedModule}
                userId={userId}
                onLessonSelect={handleLessonSelect}
                onBack={handleBackToModules}
              />
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="border-b px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="modules" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Modules
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Progress
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Achievements
                    </TabsTrigger>
                    <TabsTrigger value="practice" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Practice
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-auto">
                  <TabsContent value="modules" className="m-0 h-full">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {modules.map((module) => (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card 
                              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500"
                              onClick={() => handleModuleSelect(module)}
                            >
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="text-2xl">{module.icon}</div>
                                    <div>
                                      <CardTitle className="text-lg">{module.name}</CardTitle>
                                      <CardDescription>{module.description}</CardDescription>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className={academyUtils.getDifficultyBadgeColor(module.skill_level)}>
                                    {module.skill_level}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {academyUtils.formatDuration(module.estimated_duration * 60)} estimated
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    4 lessons
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="progress" className="m-0 h-full">
                    <ProgressDashboard userStats={userStats} userId={userId} />
                  </TabsContent>

                  <TabsContent value="achievements" className="m-0 h-full">
                    <AchievementGallery userId={userId} />
                  </TabsContent>

                  <TabsContent value="practice" className="m-0 h-full">
                    <div className="p-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            Practice Mode
                          </CardTitle>
                          <CardDescription>
                            Sharpen your skills with hands-on exercises and challenges
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-12">
                            <div className="text-4xl mb-4">🚧</div>
                            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                            <p className="text-gray-600">
                              Practice mode with interactive challenges is in development
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}