import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getEvent, generateClaimUrl } from '../lib/events';
import { format } from 'date-fns';
import QRCode from '../components/QRCode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Check, ExternalLink } from 'lucide-react';

const EventSuccess: React.FC = () => {
  const [, params] = useRoute('/event-success/:id');
  // Use the ID directly as a string for MongoDB compatibility
  const eventId = params?.id || null;
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const { toast } = useToast();

  const { data: event, isLoading, error } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
    refetchOnWindowFocus: false,
  });

  const claimUrl = eventId ? generateClaimUrl(eventId) : '';

  const copyToClipboard = () => {
    if (claimUrl) {
      navigator.clipboard.writeText(claimUrl);
      setCopiedToClipboard(true);
      toast({
        title: "Copied to clipboard",
        description: "The claim link has been copied to your clipboard.",
        variant: "default",
      });
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Event Created Successfully!</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Loading event details...
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-64 my-2" />
              <Skeleton className="h-6 w-full my-2" />
              <Skeleton className="h-6 w-1/2 my-2" />
            </CardContent>
          </Card>
          <Card className="mt-10">
            <CardContent className="p-6 text-center">
              <Skeleton className="h-6 w-64 mx-auto my-2" />
              <Skeleton className="h-64 w-64 mx-auto my-6" />
              <Skeleton className="h-6 w-full my-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Error Loading Event</h1>
        <p className="mt-3 text-xl text-red-500">Failed to load event details. Please try again.</p>
        <div className="mt-6">
          <Link href="/create-event">
            <Button>Back to Create Event</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Event Created Successfully!</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Your event has been created and a compressed token (cToken) has been minted on Solana.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Event Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Share the QR code with attendees to let them claim the token.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Event Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{event.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {format(new Date(event.date), 'MMMM d, yyyy')}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Transaction</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a 
                    href={`https://explorer.solana.com/tx/${event.tokenMintAddress}?cluster=devnet`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#9945FF] hover:text-[#9945FF]/80 flex items-center"
                  >
                    {event.tokenMintAddress.substring(0, 10)}...{event.tokenMintAddress.substring(event.tokenMintAddress.length - 5)}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <div className="mt-10">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">QR Code for Attendees</h3>
                <p className="mt-1 max-w-2xl mx-auto text-sm text-gray-500">
                  Attendees can scan this QR code to claim their proof-of-participation token.
                </p>
                
                <div className="mt-6 flex justify-center">
                  <QRCode 
                    value={claimUrl} 
                    size={256} 
                  />
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Or share this claim link:</p>
                  <div className="flex rounded-md shadow-sm">
                    <input 
                      type="text" 
                      readOnly 
                      value={claimUrl} 
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-[#9945FF] focus:border-[#9945FF] sm:text-sm border-gray-300" 
                    />
                    <button 
                      type="button" 
                      onClick={copyToClipboard}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9945FF]"
                    >
                      {copiedToClipboard ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <Link href="/create-event">
            <Button className="bg-[#9945FF] hover:bg-[#9945FF]/90">
              Create Another Event
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="ml-3">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventSuccess;
