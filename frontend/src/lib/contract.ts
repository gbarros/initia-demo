// Import the generated contract info
// This file is created by scripts/generate-contract-info.js during build
import contractInfo from '../generated/contractInfo.json';

// Get chain ID from environment variable or from generated data
export const CHAIN_ID = process.env.CHAIN_ID || contractInfo.chainId || '31337';

// Export the contract address from the generated data
export const TSHIRT_CONTRACT_ADDRESS = contractInfo.address || '0x0000000000000000000000000000000000000000';

// Export the contract ABI from the generated data
export const TSHIRT_ABI = contractInfo.abi || [];

// Log the contract configuration for debugging
console.log(`Using contract at ${TSHIRT_CONTRACT_ADDRESS} on chain ${CHAIN_ID}`);

