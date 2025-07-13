import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  Star,
  TrendingUp,
  Calendar,
  BookOpen
} from 'lucide-react';
import { academyUtils } from '../api';
import type { UserStats } from '../types';

interface ProgressDashboardProps {
  userStats: UserStats | null;
  userId: string;
}

export function ProgressDashboard({ userStats }: ProgressDashboardProps) {
  if (!userStats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No progress data available yet.</p>
              <p className="text-sm text-gray-500 mt-2">Complete your first lesson to see your progress!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLevel = userStats.level;
  const currentExp = userStats.experience;
  const nextLevelExp = academyUtils.calculateExperienceForNextLevel(currentLevel);
  const expProgress = ((currentExp % 100) / 100) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Level and Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Level & Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">Level {currentLevel}</div>
                  <div className="text-sm text-gray-600">{currentExp} XP total</div>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {currentExp % 100}/100 XP
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span>{Math.round(expProgress)}%</span>
                </div>
                <Progress value={expProgress} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{userStats.current_streak}</div>
                  <div className="text-sm text-gray-600">Current streak</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-700">{userStats.longest_streak}</div>
                  <div className="text-sm text-gray-600">Best streak</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Last activity: {new Date(userStats.last_activity_date).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userStats.total_lessons_completed}</div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userStats.total_exercises_solved}</div>
                <div className="text-sm text-gray-600">Exercises Solved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{userStats.achievements_unlocked}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {academyUtils.formatTimeSpent(userStats.total_time_spent)}
                </div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={userStats.average_score} className="w-20 h-2" />
                  <span className="text-sm font-medium">{Math.round(userStats.average_score)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Points</span>
                <Badge variant="outline" className="font-mono">
                  {userStats.total_points.toLocaleString()} pts
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-medium">
                  {userStats.total_lessons_completed > 0 ? '100%' : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Goals & Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Next Level Goal */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Next Level</span>
                  <span className="text-sm text-blue-600">
                    {100 - (currentExp % 100)} XP to go
                  </span>
                </div>
                <Progress value={expProgress} className="h-2" />
              </div>
              
              {/* Achievement Goal */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Achievement Hunter</span>
                  <span className="text-sm text-purple-600">
                    {Math.max(0, 5 - userStats.achievements_unlocked)} more to unlock
                  </span>
                </div>
                <Progress value={(userStats.achievements_unlocked / 5) * 100} className="h-2" />
              </div>
              
              {/* Streak Goal */}
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">7-Day Streak</span>
                  <span className="text-sm text-orange-600">
                    {Math.max(0, 7 - userStats.current_streak)} days to go
                  </span>
                </div>
                <Progress value={(userStats.current_streak / 7) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}