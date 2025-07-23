'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';

export default function ConnectButton() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="wallet-button" disabled>
        Connect Wallet
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-white">{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
        <button onClick={() => disconnect()} className="wallet-button">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => connect({ connector: connectors[0] })} className="wallet-button">
      Connect Wallet
    </button>
  );
}
