import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { createEvent } from '../lib/events';
import { InsertEvent } from '@shared/schema';
import { useSolana } from '../providers/SolanaProvider';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Event name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  date: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date.",
  }),
  imageUrl: z.string().optional(),
  maxAttendees: z.string().optional().transform(val => (val === "" ? undefined : parseInt(val, 10))),
});

type FormValues = z.infer<typeof formSchema>;

const CreateEvent: React.FC = () => {
  const [, navigate] = useLocation();
  const { publicKey, connected } = useSolana();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      imageUrl: "",
      maxAttendees: "",
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!connected || !publicKey) {
        throw new Error("Please connect your wallet first.");
      }

      const eventData: Omit<InsertEvent, "tokenMintAddress" | "qrCodeData" | "creator"> = {
        name: values.name,
        description: values.description,
        date: new Date(values.date),
        imageUrl: values.imageUrl || undefined,
        maxAttendees: values.maxAttendees || undefined,
      };

      return await createEvent(eventData, publicKey.toString());
    },
    onSuccess: (data) => {
      toast({
        title: "Event created successfully!",
        description: "Your event has been created and a token has been minted.",
        variant: "default",
      });
      navigate(`/event-success/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    createEventMutation.mutate(values);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Create an Event</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Fill out the form below to create an event and mint a compressed token (cToken) for attendees.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Solana Hackathon 2023"
                          {...field}
                          disabled={createEventMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={createEventMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your event..."
                          {...field}
                          rows={3}
                          disabled={createEventMutation.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description of your event. This will be stored in the token metadata.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          disabled={createEventMutation.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the event image. This will be displayed with the token.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Leave blank for unlimited"
                          {...field}
                          disabled={createEventMutation.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Limit the number of cTokens that can be claimed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert variant="warning" className="bg-yellow-50">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <AlertTitle className="text-yellow-800">Important Note</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Creating an event will mint a compressed token (cToken) on Solana Devnet using ZK Compression. 
                    Make sure your wallet is connected and has enough SOL for the transaction.
                  </AlertDescription>
                </Alert>

                {!connected && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>Wallet not connected</AlertTitle>
                    <AlertDescription>
                      Please connect your wallet first to create an event.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={createEventMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending || !connected}
                  >
                    {createEventMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Event...
                      </>
                    ) : (
                      'Create Event & Mint Token'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;
