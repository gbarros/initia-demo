import { defineChain } from 'viem'
import contractInfo from '../generated/contractInfo.json'

// Get chain ID from generated info (which is set during build time)
// This ensures our chain ID is correct even in the browser environment
const chainId = parseInt(contractInfo.chainId || '31337');

// Create a dynamic chain based on the detected chain ID
export const campMamoDemo = defineChain({
  id: chainId,
  name: `Initia Dev Chain (ID: ${chainId})`, // Include chain ID in the name for clarity
  nativeCurrency: {
    decimals: 18,
    name: 'Gabe',
    symbol: 'GAB',
  },
  rpcUrls: {
    default: {
      http: ['http://localhost:8590'],
    },
    public: {
      http: ['http://localhost:8590'],
    }
  },
})

// Log chain ID for debugging
console.log(`Using chain ID: ${chainId} from contractInfo`);
console.log('Add this network to MetaMask with these details:');
console.log(`- Network Name: ${campMamoDemo.name}`);
console.log(`- New RPC URL: http://localhost:8590`);
console.log(`- Chain ID: ${chainId}`);
console.log(`- Currency Symbol: ${campMamoDemo.nativeCurrency.symbol}`);

export default campMamoDemo;