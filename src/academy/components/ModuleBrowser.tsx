import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { academyApi, academyUtils } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  Clock, 
  Target,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import type { LearningModule, Lesson, UserLessonProgress } from '../types';

interface ModuleBrowserProps {
  module: LearningModule;
  userId: string;
  onLessonSelect: (lesson: Lesson) => void;
  onBack: () => void;
}

export function ModuleBrowser({ module, userId, onLessonSelect, onBack }: ModuleBrowserProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, UserLessonProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModuleLessons();
  }, [module.id, userId]);

  const loadModuleLessons = async () => {
    try {
      setLoading(true);
      const lessonsData = await academyApi.getLessons(module.id);
      setLessons(lessonsData);
      
      // Load progress for each lesson
      const progressPromises = lessonsData.map(async (lesson) => {
        try {
          const data = await academyApi.getLessonWithProgress(lesson.id, userId);
          return { lessonId: lesson.id, progress: data.progress };
        } catch (error) {
          return { lessonId: lesson.id, progress: null };
        }
      });
      
      const progressResults = await Promise.all(progressPromises);
      const progressMap: Record<string, UserLessonProgress> = {};
      progressResults.forEach(({ lessonId, progress }) => {
        if (progress) {
          progressMap[lessonId] = progress;
        }
      });
      
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to load module lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonUnlocked = (lesson: Lesson, index: number): boolean => {
    // First lesson is always unlocked
    if (index === 0) return true;
    
    // Check if prerequisites are met
    if (lesson.prerequisites.length === 0) return true;
    
    // Check if all prerequisite lessons are completed
    return lesson.prerequisites.every(prereq => {
      const prereqProgress = progress[prereq];
      return prereqProgress && prereqProgress.status === 'completed';
    });
  };

  const getLessonStatus = (lesson: Lesson): 'locked' | 'available' | 'in-progress' | 'completed' => {
    const lessonProgress = progress[lesson.id];
    
    if (!lessonProgress) {
      return isLessonUnlocked(lesson, lessons.findIndex(l => l.id === lesson.id)) ? 'available' : 'locked';
    }
    
    return lessonProgress.status as 'in-progress' | 'completed';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'available': return <PlayCircle className="h-5 w-5 text-gray-600" />;
      case 'locked': return <Lock className="h-5 w-5 text-gray-400" />;
      default: return <PlayCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'available': return 'Start Lesson';
      case 'locked': return 'Locked';
      default: return 'Not Started';
    }
  };

  const calculateModuleProgress = (): number => {
    if (lessons.length === 0) return 0;
    
    const completedLessons = lessons.filter(lesson => {
      const lessonProgress = progress[lesson.id];
      return lessonProgress && lessonProgress.status === 'completed';
    }).length;
    
    return (completedLessons / lessons.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Module Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{module.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{module.name}</h1>
            <p className="text-gray-600">{module.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {academyUtils.formatDuration(module.estimated_duration * 60)} estimated
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {lessons.length} lessons
          </div>
          <Badge variant="outline" className={academyUtils.getDifficultyBadgeColor(module.skill_level)}>
            {module.skill_level}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Module Progress</span>
            <span>{Math.round(calculateModuleProgress())}%</span>
          </div>
          <Progress value={calculateModuleProgress()} className="h-2" />
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const status = getLessonStatus(lesson);
          const lessonProgress = progress[lesson.id];
          const isClickable = status !== 'locked';
          
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`transition-all duration-300 ${
                  isClickable 
                    ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' 
                    : 'opacity-60 cursor-not-allowed'
                } ${status === 'completed' ? 'border-green-200 bg-green-50' : ''}`}
                onClick={() => isClickable && onLessonSelect(lesson)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        {getStatusIcon(status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{lesson.title}</h3>
                          <Badge variant="outline" className={academyUtils.getDifficultyBadgeColor(lesson.difficulty)}>
                            {lesson.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{lesson.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {academyUtils.formatDuration(lesson.duration)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {lesson.objectives.length} objectives
                          </div>
                          {lessonProgress && (
                            <div className="flex items-center gap-1">
                              <span>Score: {lessonProgress.score}/100</span>
                            </div>
                          )}
                        </div>
                        
                        {lessonProgress && lessonProgress.status === 'in-progress' && (
                          <div className="mt-2">
                            <Progress value={lessonProgress.progress_percentage} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700">
                          {getStatusText(status)}
                        </div>
                      </div>
                      
                      {isClickable && (
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}