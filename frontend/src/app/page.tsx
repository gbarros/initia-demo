'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';

import { shirts, useShirtPrice, buyShirt, type Shirt } from '../lib/contractHooks';
import ConnectButton from '../components/ConnectButton';
import ShirtCarousel from '../components/ShirtCarousel';
import SelectedShirtDetails from '../components/SelectedShirtDetails';
import "./tshirt-shop.css";

export default function Home() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [hash, setHash] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [selectedShirt, setSelectedShirt] = useState(shirts[0]);

  const handleShirtSelect = (shirt: Shirt) => setSelectedShirt(shirt);

  // Use the custom hook to get the price in TIA
  const { data: priceInTia } = useShirtPrice();
  console.log(`getPriceInTia result:`, priceInTia);

  const handleBuyShirt = useCallback(async (selectedShirt: Shirt) => {
    if (!walletClient || !address) {
      console.error("Wallet not connected");
      return;
    }

    setIsPending(true);
    setHash(null);
    setTxError(null);

    try {
      const { txHash, error } = await buyShirt({
        walletClient,
        address,
        selectedShirt,
        priceInTia,
        switchChainAsync
      });
      
      if (txHash) {
        setHash(txHash);
      }
      
      if (error) {
        setTxError(error);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      if (error instanceof Error) {
        setTxError(error.message);
      } else {
        setTxError("An unknown error occurred.");
      }
    } finally {
      setIsPending(false);
    }
  }, [address, walletClient, priceInTia, switchChainAsync]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-container">
          <h1 className="shop-title">Camp Mamo <span className="title-highlight">T-Shirt Shop</span></h1>
          <ConnectButton />
        </div>
      </header>

      <main className="main-content">
        <h2 className="page-title">Camp Mamo T-Shirts</h2>
        
        <ShirtCarousel 
          shirts={shirts} 
          selectedShirt={selectedShirt} 
          onShirtSelect={handleShirtSelect} 
        />

        <SelectedShirtDetails 
          selectedShirt={selectedShirt} 
          isPending={isPending} 
          hash={hash} 
          txError={txError} 
          onBuyClick={handleBuyShirt} 
        />
      </main>

      <footer className="app-footer">
        <p className="footer-text">&copy; 2025 Camp Mamo. All rights reserved.</p>
      </footer>
    </div>
  );
}
