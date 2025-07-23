import React, { useState, createContext, useContext } from 'react';

// Simple Wallet Context
type WalletContextType = {
  address: string | null;
  connecting: boolean;
  connected: boolean;
  connectWallet: () => void;
  openWallet: () => void;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  connecting: false,
  connected: false,
  connectWallet: () => {},
  openWallet: () => {},
  disconnectWallet: () => {},
});

// Simplified hook to use the wallet context
export const useWalletConnect = () => useContext(WalletContext);

// Mock wallet provider - in a real app, this would connect to Initia
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  
  // Mock connect wallet function - in a real app, this would use the actual wallet API
  const connectWallet = () => {
    setConnecting(true);
    setTimeout(() => {
      // This is a mock wallet address that would come from the actual wallet connection
      const mockAddress = "initia1mock" + Math.random().toString(16).substring(2, 12);
      setAddress(mockAddress);
      setConnecting(false);
    }, 1000);
  };
  
  // Mock open wallet function
  const openWallet = () => {
    if (!address) {
      connectWallet();
      return;
    }
    
    alert(`Wallet opened for address: ${address}`);
  };
  
  // Mock disconnect wallet function
  const disconnectWallet = () => {
    setAddress(null);
  };
  
  return (
    <WalletContext.Provider 
      value={{
        address,
        connecting,
        connected: !!address,
        connectWallet,
        openWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Button component for connecting wallet
export function ConnectWalletButton() {
  const { connectWallet, connected, connecting, address } = useWalletConnect();
  
  if (connected) {
    return (
      <button 
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        disabled
      >
        Connected: {address?.substring(0, 8)}...
      </button>
    );
  }
  
  return (
    <button 
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      onClick={connectWallet}
      disabled={connecting}
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

// Button component for viewing wallet
export function ViewWalletButton() {
  const { openWallet, connected } = useWalletConnect();
  
  if (!connected) {
    return null;
  }
  
  return (
    <button 
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-2"
      onClick={openWallet}
    >
      View Wallet
    </button>
  );
}
