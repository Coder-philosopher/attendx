import React from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEvent, claimToken, hasWalletClaimedToken } from '../lib/events';
import { claimCompressedToken } from '../lib/solana';
import { useSolana } from '../providers/SolanaProvider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ClaimToken: React.FC = () => {
  const [, params] = useRoute('/claim/:eventId');
  const [, navigate] = useLocation();
  // Use the ID directly as a string for MongoDB compatibility
  const eventId = params?.eventId || null;
  const { publicKey, connected, connect } = useSolana();
  const { toast } = useToast();

  // Get event details
  const { data: event, isLoading: isLoadingEvent, error: eventError } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
    refetchOnWindowFocus: false,
  });

  // Check if wallet has already claimed
  const { data: claimStatus, isLoading: isCheckingClaim } = useQuery({
    queryKey: [`/api/events/${eventId}/claims/${publicKey?.toString()}`],
    enabled: !!eventId && !!publicKey,
    refetchOnWindowFocus: false,
  });

  // Handle token claim
  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!connected || !publicKey || !event) {
        throw new Error("Please connect your wallet first");
      }

      try {
        console.log(`Initiating token claim for event ID: ${eventId} with wallet: ${publicKey.toString()}`);
        
        // Step 1: Perform on-chain token claim
        const { transactionSignature } = await claimCompressedToken(
          eventId!,
          event.tokenMintAddress,
          publicKey.toString()
        );
        
        console.log(`On-chain token claim successful, signature: ${transactionSignature}`);

        // Step 2: Record the claim in our backend
        const result = await claimToken(
          eventId!,
          event.tokenMintAddress,
          publicKey.toString(),
          transactionSignature
        );
        
        console.log(`Backend token claim recorded successfully:`, result);
        return result;
      } catch (error) {
        console.error('Token claim failed with error:', error);
        // Re-throw the error for the mutation to handle
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Token claimed successfully!",
        description: "The participation token has been added to your wallet.",
        variant: "default",
      });
      navigate(`/claim-success/${eventId}`);
    },
    onError: (error) => {
      let errorMessage = "An unexpected error occurred.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Specific error handling for common issues
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes("Event not found")) {
          errorMessage = "This event doesn't exist or has been deleted.";
        } else if (errorMessage.includes("already claimed")) {
          errorMessage = "You've already claimed a token for this event.";
        } else if (errorMessage.includes("transaction")) {
          errorMessage = "Blockchain transaction failed. Please try again.";
        }
      }
      
      toast({
        title: "Failed to claim token",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleClaim = async () => {
    if (!connected) {
      try {
        await connect();
      } catch (error) {
        toast({
          title: "Failed to connect wallet",
          description: error instanceof Error ? error.message : "Failed to connect wallet",
          variant: "destructive",
        });
        return;
      }
    }

    claimMutation.mutate();
  };

  const isLoading = isLoadingEvent || isCheckingClaim || claimMutation.isPending;
  const alreadyClaimed = claimStatus?.hasClaimed;

  if (isLoadingEvent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto mt-4" />
          <Skeleton className="h-6 w-80 mx-auto mt-2" />
        </div>
        <div className="mt-10 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-24 w-full mt-6" />
              <Skeleton className="h-10 w-full mt-8" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Event Not Found</AlertTitle>
          <AlertDescription>
            We couldn't find the event you're looking for. It may have been removed or the link might be incorrect.
          </AlertDescription>
        </Alert>
        <div className="mt-6">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Claim Your Participation Token</h1>
        <p className="mt-3 text-xl text-gray-500">
          You've been invited to claim a proof-of-participation token for attending:
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#9945FF]">{event.name}</h2>
      </div>

      <div className="mt-10 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <img 
              src={event.imageUrl || "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80"} 
              alt={`Digital Token for ${event.name}`} 
              className="w-full h-auto rounded-lg shadow-md" 
            />
            
            <div className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
              <p>
                This compressed token (cToken) is a digital proof of your participation in {event.name}. 
                It's stored efficiently on the Solana blockchain using ZK Compression technology.
              </p>
            </div>

            {alreadyClaimed && (
              <Alert className="mt-6 bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertTitle className="text-green-800">Already Claimed</AlertTitle>
                <AlertDescription className="text-green-700">
                  You've already claimed this token. Check your wallet or view all your tokens in the My Tokens page.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-8">
              {!connected && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <AlertTitle className="text-blue-800">Wallet Required</AlertTitle>
                  <AlertDescription className="flex flex-col md:flex-row md:justify-between items-start text-blue-700">
                    <p>To claim this token, you'll need a Solana wallet. We recommend using Phantom or Backpack.</p>
                    <a 
                      href="https://phantom.app/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="md:ml-6 mt-2 md:mt-0 whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                    >
                      Get Wallet <span aria-hidden="true">→</span>
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center">
                <Button
                  className="w-full bg-[#9945FF] hover:bg-[#9945FF]/90 py-6 text-lg"
                  onClick={handleClaim}
                  disabled={isLoading || alreadyClaimed}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {connected ? 'Claiming Token...' : 'Connecting Wallet...'}
                    </>
                  ) : alreadyClaimed ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Token Already Claimed
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                      </svg>
                      {connected ? 'Claim Token' : 'Connect Wallet to Claim'}
                    </>
                  )}
                </Button>
                
                {alreadyClaimed && (
                  <div className="mt-4">
                    <Link href="/my-tokens">
                      <Button variant="outline">
                        View My Tokens
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimToken;
