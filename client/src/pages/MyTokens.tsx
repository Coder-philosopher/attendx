import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getTokensByWallet } from '../lib/events';
import { useSolana } from '../providers/SolanaProvider';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LogOut } from 'lucide-react';
import { truncateAddress } from '../lib/solana';

const MyTokens: React.FC = () => {
  const { publicKey, connected, disconnect } = useSolana();

  const { data: tokenClaims, isLoading, error } = useQuery({
    queryKey: publicKey ? [`/api/wallets/${publicKey.toString()}/claims`] : null,
    enabled: !!publicKey,
    refetchOnWindowFocus: false,
  });

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">My Participation Tokens</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Connect your wallet to view your tokens.
          </p>
        </div>
        
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Wallet not connected</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to view your participation tokens.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">My Participation Tokens</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          View all your proof-of-participation compressed tokens collected from events.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 font-medium">Connected Wallet:</span>
              <span className="ml-2 text-gray-900">{publicKey ? truncateAddress(publicKey.toString()) : ''}</span>
            </div>
            <button 
              onClick={disconnect}
              className="text-sm font-medium text-[#9945FF] hover:text-[#9945FF]/80 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Disconnect
            </button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6 border-blue-100">
        <CardContent className="p-4 bg-blue-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <InfoIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This application now supports multiple Solana wallets including Phantom, Backpack, and MetaMask.
                  In the demo mode, transactions are simulated and won't be visible on explorers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-1 h-4 w-1/2" />
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-5 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error loading tokens</AlertTitle>
          <AlertDescription>
            Failed to load your tokens. Please try again later.
          </AlertDescription>
        </Alert>
      ) : tokenClaims && tokenClaims.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tokenClaims.map((claim: any) => (
            <Card key={claim.id} className="overflow-hidden">
              <img 
                src={claim.event.imageUrl || "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80"} 
                alt={`${claim.event.name} Token`} 
                className="h-48 w-full object-cover" 
              />
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{claim.event.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{format(new Date(claim.event.date), 'MMMM d, yyyy')}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Token ID</span>
                    <span className="text-xs text-gray-900">{truncateAddress(claim.event.tokenMintAddress)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href={`https://explorer.solana.com/tx/${claim.transactionSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9945FF] hover:text-[#9945FF]/80 text-sm font-medium flex items-center"
                  >
                    View Transaction <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tokens found</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't claimed any participation tokens yet.</p>
          <div className="mt-6">
            <Link href="/">
              <Button className="bg-[#9945FF] hover:bg-[#9945FF]/90">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/">
          <Button variant="outline">
            Browse More Events
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MyTokens;
