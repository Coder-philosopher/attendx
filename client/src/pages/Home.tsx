import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../lib/events';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Event } from '@shared/schema';

const Home: React.FC = () => {
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="relative h-96 flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block">Proof of Participation</span>
              <span className="block text-[#14F195]">on Solana</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Create and collect compressed tokens that prove your participation in events, efficiently stored on Solana using ZK Compression.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:flex sm:justify-center md:mt-12">
              <div className="rounded-md shadow">
                <Link 
                  href="/create-event"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#9945FF] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Create Event
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link 
                  href="/my-tokens"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#9945FF] bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10"
                >
                  View My Tokens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-[#9945FF] font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to prove participation
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Using Solana's ZK Compression, we've created a gas-efficient way to issue and collect proof-of-participation tokens.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#9945FF] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Create Events</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Easily create events and mint compressed tokens (cTokens) as unique badges for attendance verification.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#14F195] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">QR Verification</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Generate unique QR codes for each event allowing attendees to claim tokens via Solana Pay.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#00C2FF] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Collect Tokens</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Build a collection of attendance tokens that prove your participation history in various events.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-[#9945FF] font-semibold tracking-wide uppercase">Discover</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">Recent Events</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <div className="flex items-baseline">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="ml-2 h-4 w-24" />
                    </div>
                    <Skeleton className="mt-2 h-7 w-3/4" />
                    <Skeleton className="mt-2 h-16 w-full" />
                    <div className="mt-4">
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center">
                <p className="text-red-500">Failed to load events. Please try again later.</p>
              </div>
            ) : events && events.length > 0 ? (
              events?.slice(0, 3).map((event: Event) => (
                <Card key={event.id} className="overflow-hidden">
                  <img 
                    src={event.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400&q=80"} 
                    alt={`${event.name} Event`} 
                    className="h-48 w-full object-cover" 
                  />
                  <CardContent className="p-6">
                    <div className="flex items-baseline">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                      <div className="ml-2 text-xs text-gray-500">
                        {format(new Date(event.date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900">{event.name}</h3>
                    <p className="mt-2 text-gray-500 text-sm">{event.description}</p>
                    <div className="mt-4">
                      <Link 
                        href={`/claim/${event.id}`}
                        className="text-[#9945FF] hover:text-[#9945FF]/80 font-medium text-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center">
                <p className="text-gray-500">No events available. Be the first to create one!</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/create-event" 
              className="inline-flex items-center px-4 py-2 border border-[#9945FF] text-sm font-medium rounded-md text-[#9945FF] bg-white hover:bg-gray-50"
            >
              View All Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
