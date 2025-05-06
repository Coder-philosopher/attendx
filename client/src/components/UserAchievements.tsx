import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserAchievements, getUserStats } from '@/lib/events';
import { useSolana } from '@/providers/SolanaProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Trophy, Medal, Star, AlertCircle } from 'lucide-react';

const AchievementCard = ({ achievement, earned = false }: { achievement: any, earned?: boolean }) => {
  const rarityColors = {
    common: 'bg-slate-200 text-slate-700',
    uncommon: 'bg-green-200 text-green-700',
    rare: 'bg-blue-200 text-blue-700',
    epic: 'bg-purple-200 text-purple-700',
    legendary: 'bg-yellow-200 text-amber-700',
  };

  const rarityColor = rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common;

  return (
    <Card className={`w-full ${earned ? 'border-2 border-green-500' : 'opacity-70'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{achievement.title}</CardTitle>
          <Badge className={rarityColor}>{achievement.rarity}</Badge>
        </div>
        <CardDescription>{achievement.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-2">
          {achievement.badgeImageUrl ? (
            <img src={achievement.badgeImageUrl} alt={achievement.title} className="w-16 h-16" />
          ) : (
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
              <Trophy size={32} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {achievement.points} points
        </div>
        {earned && (
          <div className="text-sm text-green-600 font-medium">
            EARNED
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const UserStatsCard = ({ stats }: { stats: any }) => {
  if (!stats) return null;

  // Calculate percentage to next level (100 points per level)
  const pointsToNextLevel = 100;
  const currentLevelPoints = (stats.level - 1) * pointsToNextLevel;
  const pointsInCurrentLevel = stats.totalPoints - currentLevelPoints;
  const percentToNextLevel = Math.min(100, (pointsInCurrentLevel / pointsToNextLevel) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Medal className="h-5 w-5" />
          Level {stats.level}
        </CardTitle>
        <CardDescription>
          {stats.totalPoints} total points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{pointsInCurrentLevel}/{pointsToNextLevel} points</span>
            </div>
            <Progress value={percentToNextLevel} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{stats.eventsCreated}</span>
              <span className="text-sm text-muted-foreground">Events Created</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{stats.eventsAttended}</span>
              <span className="text-sm text-muted-foreground">Events Attended</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{stats.achievementsEarned}</span>
              <span className="text-sm text-muted-foreground">Achievements</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{stats.tokensCollected}</span>
              <span className="text-sm text-muted-foreground">Tokens Collected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function UserAchievements() {
  const { publicKey } = useSolana();
  const walletAddress = publicKey?.toBase58();

  const { 
    data: achievementsData,
    isLoading: isLoadingAchievements,
    error: achievementsError
  } = useQuery({
    queryKey: ['achievements', walletAddress],
    queryFn: () => walletAddress ? getUserAchievements(walletAddress) : null,
    enabled: !!walletAddress
  });

  const { 
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['stats', walletAddress],
    queryFn: () => walletAddress ? getUserStats(walletAddress) : null,
    enabled: !!walletAddress
  });

  if (!walletAddress) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not connected</AlertTitle>
        <AlertDescription>
          Please connect your wallet to view your achievements.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoadingAchievements || isLoadingStats) {
    return <div className="text-center py-8">Loading achievements and stats...</div>;
  }

  if (achievementsError || statsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error loading your achievements. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <UserStatsCard stats={statsData} />

      <Tabs defaultValue="earned">
        <TabsList className="w-full">
          <TabsTrigger value="earned" className="flex-1">
            Earned ({achievementsData?.earned?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex-1">
            Available ({achievementsData?.available?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="earned" className="mt-4">
          {achievementsData?.earned?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsData.earned.map((achievement: any) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  earned={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <Star className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No achievements earned yet. Start creating or attending events!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          {achievementsData?.available?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsData.available.map((achievement: any) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <p>All achievements have been earned. Congratulations!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}