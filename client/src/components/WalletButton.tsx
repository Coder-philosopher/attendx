import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSolana } from '../providers/SolanaProvider';
import { truncateAddress } from '../lib/solana';

const WalletButton: React.FC = () => {
  const { connected, publicKey, connect, disconnect } = useSolana();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully.",
        variant: "default",
      });
    } catch (error) {
      // Check if the error is about Phantom not being installed
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      
      if (errorMessage.includes("Phantom wallet not found")) {
        toast({
          title: "Phantom wallet not found",
          description: (
            <div>
              <p className="mb-2">Please install the Phantom wallet extension to connect.</p>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-white hover:text-gray-200"
              >
                Get Phantom Wallet
              </a>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected.",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={connected ? handleDisconnect : handleConnect}
      className="ml-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center"
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : connected && publicKey ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {truncateAddress(publicKey.toString())}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#9945FF]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
};

export default WalletButton;
