import React from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getEvent } from '../lib/events';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Check } from 'lucide-react';

const ClaimSuccess: React.FC = () => {
  const [, params] = useRoute('/claim-success/:eventId');
  // Use the ID directly as a string for MongoDB compatibility
  const eventId = params?.eventId || null;

  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-8 w-80 mx-auto mt-4" />
          <Skeleton className="h-6 w-96 mx-auto mt-2" />
        </div>
        <div className="mt-10 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-64 mx-auto" />
              <Skeleton className="h-6 w-40 mx-auto mt-6" />
              <Skeleton className="h-4 w-20 mx-auto mt-1" />
              <Skeleton className="h-48 w-full mt-8" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Error Loading Token</h1>
        <p className="mt-3 text-xl text-red-500">Failed to load token details. Please try again.</p>
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
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Token Claimed Successfully!</h1>
        <p className="mt-3 text-xl text-gray-500">
          The {event.name} participation token has been added to your wallet.
        </p>
      </div>

      <div className="mt-10 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <img 
                src={event.imageUrl || "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80"} 
                alt={`Digital Token for ${event.name}`} 
                className="w-64 h-auto rounded-lg shadow-md" 
              />
              
              <div className="mt-6 text-center">
                <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Token Type</dt>
                  <dd className="text-sm text-gray-900">Compressed NFT (cNFT)</dd>
                </div>
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Token ID</dt>
                  <dd className="text-sm text-gray-900 flex items-center">
                    {event.tokenMintAddress.substring(0, 5)}...{event.tokenMintAddress.substring(event.tokenMintAddress.length - 4)}
                    <button 
                      onClick={() => navigator.clipboard.writeText(event.tokenMintAddress)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                      </svg>
                    </button>
                  </dd>
                </div>
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Transaction</dt>
                  <dd className="text-sm text-gray-900">
                    <a 
                      href={`https://explorer.solana.com/tx/${event.tokenMintAddress}?cluster=devnet`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#9945FF] hover:text-[#9945FF]/80 flex items-center"
                    >
                      View on Explorer
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 flex justify-center space-x-3">
              <Link href="/my-tokens">
                <Button className="bg-[#9945FF] hover:bg-[#9945FF]/90">
                  View My Tokens
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimSuccess;
