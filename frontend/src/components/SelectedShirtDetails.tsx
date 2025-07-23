'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { type Shirt } from '../lib/contractHooks';

interface SelectedShirtDetailsProps {
  selectedShirt: Shirt;
  isPending: boolean;
  hash: string | null;
  txError: string | null;
  onBuyClick: (shirt: Shirt) => void;
}

export default function SelectedShirtDetails({ 
  selectedShirt, 
  isPending, 
  hash, 
  txError, 
  onBuyClick 
}: SelectedShirtDetailsProps) {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [mounted, setMounted] = useState(false);
  
  // Client-side only code
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="selected-shirt-details">
      <h3 className="selected-shirt-name">{selectedShirt.name}</h3>
      <p className="selected-shirt-price">{selectedShirt.price} ETH</p>
      {mounted && isConnected ? (
        <button 
          onClick={() => onBuyClick(selectedShirt)} 
          disabled={isPending} 
          className={isPending ? 'buy-button-disabled' : 'buy-button'}
        >
          {isPending ? 'Confirming...' : 'Buy Now'}
        </button>
      ) : (
        <button 
          onClick={() => connect({ connector: connectors[0] })} 
          className="buy-button"
        >
          Connect Wallet to Buy
        </button>
      )}
      {hash && <div className="mt-4 text-green-400">Success! Tx Hash: {hash}</div>}
      {txError && <div className="mt-4 text-red-500">Error: {txError}</div>}
    </div>
  );
}
