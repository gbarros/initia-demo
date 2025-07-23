import { useReadContract } from 'wagmi';
import { parseEther, type Address } from 'viem';
import { TSHIRT_CONTRACT_ADDRESS, TSHIRT_ABI } from './contract';
import chain from './chain';

// Type for shirt
export type Shirt = {
  id: number;
  name: string;
  price: number;
  image: string;
};

// Sample shirt data
export const shirts: Shirt[] = [
  { id: 1, name: "OG Hoodie", price: 0.01, image: "/assets/shirts/01-og-hoodie.png" },
  { id: 2, name: "OG Hoodie Limited", price: 0.01, image: "/assets/shirts/02-og-hoodie-2.png" },
  { id: 3, name: "Beach Vibes", price: 0.01, image: "/assets/shirts/03-beach-vibes.png" },
  { id: 4, name: "Beach Vibes Sandy", price: 0.01, image: "/assets/shirts/04-beach-vibes-sandy.png" },
  { id: 5, name: "City Boy", price: 0.01, image: "/assets/shirts/05-city-boy.png" },
  { id: 6, name: "Eiffel Tower", price: 0.01, image: "/assets/shirts/06-eiffel-tower.png" },
  { id: 7, name: "Wonder City", price: 0.01, image: "/assets/shirts/07-wonder-city.png" },
  { id: 8, name: "Mamo Special", price: 0.01, image: "/assets/shirts/08-mamo-special.png" },
  { id: 9, name: "Purple Cute", price: 0.01, image: "/assets/shirts/09-purple-cute.jpg" },
  { id: 10, name: "Stomping", price: 0.01, image: "/assets/shirts/10-stomping.jpg" }
];

/**
 * Hook to get the price of a T-shirt in TIA
 */
export function useShirtPrice() {
  const result = useReadContract({
    address: TSHIRT_CONTRACT_ADDRESS as Address,
    abi: TSHIRT_ABI,
    functionName: 'getPriceInTia',
    args: [],
    chainId: chain.id,
  });
  
  // Properly type the data as bigint | undefined | null
  return {
    ...result,
    data: result.data as bigint | undefined | null
  };
}

/**
 * Function to buy a T-shirt
 * @param walletClient - The wallet client
 * @param address - The user's address
 * @param selectedShirt - The selected shirt
 * @param priceInTia - The price in TIA from the contract
 * @param switchChainAsync - Function to switch chains
 * @returns Object with transaction hash and error handling
 */
export async function buyShirt({
  walletClient,
  address,
  selectedShirt,
  priceInTia,
  switchChainAsync
}: {
  walletClient: any;
  address: string;
  selectedShirt: Shirt;
  priceInTia: bigint | undefined | null;
  switchChainAsync?: (params: { chainId: number }) => Promise<any>;
}): Promise<{ txHash: string | null; error: string | null }> {
  if (!walletClient || !address) {
    console.error("Wallet not connected");
    throw new Error("Wallet not connected");
  }

  try {
    if (walletClient.chain.id !== chain.id && switchChainAsync) {
      await switchChainAsync({ chainId: chain.id });
    }
    
    // Get the current price from the contract or use a fallback
    // If priceInTia is not available yet, we'll use a default price based on the shirt
    const priceBigInt = priceInTia !== undefined && priceInTia !== null
      ? priceInTia as bigint
      : parseEther(selectedShirt.price.toString());
      
    console.log(`Price in TIA for shirt ${selectedShirt.id}: ${priceBigInt}`);
    
    // Then buy the shirt with the correct price and token ID
    const txHash = await walletClient.writeContract({
      address: TSHIRT_CONTRACT_ADDRESS as Address,
      abi: TSHIRT_ABI,
      functionName: 'buy',
      args: [BigInt(selectedShirt.id)],
      value: priceBigInt,
      chain: chain,
    });
    
    return { txHash, error: null };
  } catch (error) {
    console.error("Transaction failed:", error);
    let errorMessage = "An unknown error occurred.";
    
    if (error instanceof Error) {
      errorMessage = (error as any).shortMessage || error.message;
    }
    
    return { txHash: null, error: errorMessage };
  }
}
