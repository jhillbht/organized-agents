import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { academyApi, academyUtils } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Target,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Lightbulb
} from 'lucide-react';
import type { Lesson, UserLessonProgress } from '../types';

interface LessonViewerProps {
  lesson: Lesson;
  userId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function LessonViewer({ lesson, userId, onComplete, onBack }: LessonViewerProps) {
  const [progress, setProgress] = useState<UserLessonProgress | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('content');
  const [currentSection, setCurrentSection] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessonData();
    
    // Start tracking time
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lesson.id, userId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      const data = await academyApi.getLessonWithProgress(lesson.id, userId);
      setProgress(data.progress || null);
      setExercises(data.exercises || []);
      
      // Start the lesson if not already started
      if (!data.progress || data.progress.status === 'not-started') {
        await academyApi.startLesson(lesson.id, userId);
        // Reload to get updated progress
        const updatedData = await academyApi.getLessonWithProgress(lesson.id, userId);
        setProgress(updatedData.progress || null);
      }
    } catch (error) {
      console.error('Failed to load lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      const result = await academyApi.completeLesson(lesson.id, userId, 100, timeSpent);
      
      if (result.success) {
        onComplete();
        
        // Show achievement notifications if any
        if (result.achievements_unlocked && result.achievements_unlocked.length > 0) {
          // You could show a toast or modal here for achievements
          console.log('Achievements unlocked:', result.achievements_unlocked);
        }
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  const parseLessonContent = () => {
    try {
      const content = JSON.parse(lesson.content);
      return content.sections || [];
    } catch (error) {
      // Fallback for simple text content
      return [{
        id: 'main',
        type: 'text',
        title: lesson.title,
        content: lesson.content
      }];
    }
  };

  const sections = parseLessonContent();
  const isCompleted = progress?.status === 'completed';
  const completionPercentage = progress?.progress_percentage || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Lesson Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{lesson.title}</h1>
                <Badge variant="outline" className={academyUtils.getDifficultyBadgeColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </Badge>
                {isCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
              </div>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {Math.round(completionPercentage)}%
            </div>
            <Progress value={completionPercentage} className="w-32 h-2" />
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {academyUtils.formatDuration(lesson.duration)}
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {lesson.objectives.length} objectives
          </div>
          <div className="flex items-center gap-1">
            <PlayCircle className="h-4 w-4" />
            {academyUtils.formatTimeSpent(timeSpent)} spent
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-6 pt-4">
            <TabsList>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="objectives" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Objectives
              </TabsTrigger>
              {exercises.length > 0 && (
                <TabsTrigger value="exercises" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Exercises ({exercises.length})
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="content" className="m-0 h-full">
              <div className="p-6">
                {sections.map((section: any, index: number) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-8"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: academyUtils.parseMarkdown(section.content) 
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="objectives" className="m-0 h-full">
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Objectives</CardTitle>
                    <CardDescription>
                      What you'll learn in this lesson
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lesson.objectives.map((objective, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span>{objective}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {exercises.length > 0 && (
              <TabsContent value="exercises" className="m-0 h-full">
                <div className="p-6">
                  <div className="space-y-4">
                    {exercises.map((exercise, index) => (
                      <Card key={exercise.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{exercise.title}</CardTitle>
                            <Badge variant="outline">
                              {exercise.points} points
                            </Badge>
                          </div>
                          <CardDescription>{exercise.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <Lightbulb className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                            <p className="text-gray-600">
                              Interactive exercises coming soon!
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Button>
          
          <div className="flex items-center gap-3">
            {!isCompleted && (
              <Button onClick={handleCompleteLesson}>
                <Trophy className="h-4 w-4 mr-2" />
                Complete Lesson
              </Button>
            )}
            
            {lesson.next_lesson && (
              <Button variant="outline">
                Next Lesson
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}