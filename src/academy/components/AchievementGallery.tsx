import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { academyApi, academyUtils } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Star, Zap } from 'lucide-react';

interface AchievementGalleryProps {
  userId: string;
}

export function AchievementGallery({ userId }: AchievementGalleryProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await academyApi.getUserAchievements(userId);
      setAchievements(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    switch (filter) {
      case 'unlocked':
        return achievements.filter(a => a.unlocked);
      case 'locked':
        return achievements.filter(a => !a.unlocked);
      case 'lesson':
        return achievements.filter(a => a.category === 'lesson');
      case 'exercise':
        return achievements.filter(a => a.category === 'exercise');
      case 'streak':
        return achievements.filter(a => a.category === 'streak');
      default:
        return achievements;
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return '🏆';
      case 'epic': return '💜';
      case 'rare': return '💎';
      case 'uncommon': return '🔹';
      case 'common': return '⭐';
      default: return '🏅';
    }
  };

  const getRarityBackground = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-br from-yellow-200 to-yellow-400';
      case 'epic': return 'bg-gradient-to-br from-purple-200 to-purple-400';
      case 'rare': return 'bg-gradient-to-br from-blue-200 to-blue-400';
      case 'uncommon': return 'bg-gradient-to-br from-green-200 to-green-400';
      case 'common': return 'bg-gradient-to-br from-gray-200 to-gray-400';
      default: return 'bg-gradient-to-br from-gray-100 to-gray-300';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Achievement Gallery</h2>
            <p className="text-gray-600">Track your learning milestones and accomplishments</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">{unlockedCount}/{totalCount}</div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            Unlocked
          </TabsTrigger>
          <TabsTrigger value="locked" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Locked
          </TabsTrigger>
          <TabsTrigger value="lesson">Lessons</TabsTrigger>
          <TabsTrigger value="exercise">Exercises</TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Streaks
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredAchievements().map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                achievement.unlocked 
                  ? 'border-2 border-yellow-300 shadow-lg' 
                  : 'opacity-60 grayscale'
              }`}
            >
              {/* Rarity Background */}
              <div 
                className={`absolute inset-0 opacity-20 ${
                  achievement.unlocked ? getRarityBackground(achievement.rarity) : 'bg-gray-100'
                }`} 
              />
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${academyUtils.getRarityColor(achievement.rarity)}`}
                        >
                          {getRarityIcon(achievement.rarity)} {achievement.rarity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {achievement.points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {achievement.unlocked && (
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="relative">
                <CardDescription className="mb-3">
                  {achievement.description}
                </CardDescription>
                
                {!achievement.unlocked && achievement.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(achievement.progress)}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-1" />
                  </div>
                )}
                
                {achievement.unlocked && achievement.unlocked_at && (
                  <div className="text-xs text-gray-500 mt-2">
                    Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {getFilteredAchievements().length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No achievements found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Start learning to unlock your first achievement!'
                : `No ${filter} achievements to display.`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories Summary */}
      {filter === 'all' && achievements.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {['lesson', 'exercise', 'streak'].map(category => {
            const categoryAchievements = achievements.filter(a => a.category === category);
            const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
            const categoryPercentage = categoryAchievements.length > 0 
              ? (unlockedInCategory / categoryAchievements.length) * 100 
              : 0;
            
            return (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{category} Achievements</h4>
                    <span className="text-sm text-gray-600">
                      {unlockedInCategory}/{categoryAchievements.length}
                    </span>
                  </div>
                  <Progress value={categoryPercentage} className="h-1" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}