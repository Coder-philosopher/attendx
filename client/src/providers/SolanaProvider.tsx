import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

interface SolanaContextType {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connection: Connection;
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

export const useSolana = (): SolanaContextType => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};

export const SolanaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [adapter, setAdapter] = useState<PhantomWalletAdapter | null>(null);
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Initialize wallet adapter
  useEffect(() => {
    const loadAdapter = async () => {
      try {
        // Check if Phantom is installed
        if ('phantom' in window) {
          const phantomAdapter = new PhantomWalletAdapter();
          setAdapter(phantomAdapter);

          // Check for previous connection
          if (phantomAdapter.connected) {
            setConnected(true);
            setPublicKey(phantomAdapter.publicKey);
          }
        } else {
          console.warn("Phantom wallet not found. Please install Phantom wallet extension.");
        }
      } catch (error) {
        console.error("Error initializing wallet adapter:", error);
      }
    };

    loadAdapter();

    // Clean up adapter on unmount
    return () => {
      if (adapter && adapter.connected) {
        adapter.disconnect();
      }
    };
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (!adapter) {
      console.warn("Wallet adapter not initialized - checking if Phantom is installed...");
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && typeof window.open === 'function') {
        // Phantom is not installed, throw a more descriptive error
        throw new Error("Phantom wallet not found. Please install the Phantom browser extension.");
      } else {
        throw new Error("Wallet adapter not initialized in this environment");
      }
    }

    try {
      setConnecting(true);
      await adapter.connect();
      setConnected(adapter.connected);
      setPublicKey(adapter.publicKey);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [adapter]);

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    if (!adapter) {
      return;
    }

    try {
      await adapter.disconnect();
      setConnected(false);
      setPublicKey(null);
    } catch (error) {
      console.error("Error disconnecting from wallet:", error);
      throw error;
    }
  }, [adapter]);

  const value = {
    connected,
    connecting,
    publicKey,
    connect,
    disconnect,
    connection,
  };

  return (
    <SolanaContext.Provider value={value}>
      {children}
    </SolanaContext.Provider>
  );
};
