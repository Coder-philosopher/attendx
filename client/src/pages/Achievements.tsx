import React from 'react';
import UserAchievements from '@/components/UserAchievements';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSolana } from '@/providers/SolanaProvider';
import { checkAchievements } from '@/lib/events';
import { TrophyIcon, CheckCircleIcon, AwardIcon } from 'lucide-react';

export default function Achievements() {
  const { publicKey } = useSolana();
  const { toast } = useToast();
  const walletAddress = publicKey?.toBase58();

  const handleManualCheck = async (type: 'creator' | 'participant') => {
    if (!walletAddress) return;

    try {
      await checkAchievements(walletAddress, type);
      toast({
        title: 'Achievement Check',
        description: `Checked ${type} achievements successfully.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to check achievements: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          </div>
          
          {walletAddress && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleManualCheck('creator')}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Check Creator Achievements
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleManualCheck('participant')}
              >
                <AwardIcon className="h-4 w-4 mr-2" />
                Check Participant Achievements
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground">
          Track your progress, earn achievements, and level up as you create and attend events.
        </p>
        
        <UserAchievements />
      </div>
    </div>
  );
}