/**
 * Script to check the gas token balance of an EVM-compatible address.
 * 
 * This script connects to an EVM node (like Anvil or a public testnet)
 * and fetches the native gas token balance (e.g., ETH) for a given address.
 * 
 * It uses environment variables for configuration and provides clear, 
 * human-readable output.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables
dotenv.config();

const EVM_NODE_URL = process.env.EVM_NODE_URL || 'http://localhost:8545';
const TOKEN_DECIMALS = 18; // Standard for ETH and many other gas tokens

/**
 * Check if a string is a valid Ethereum address
 * 
 * @param address - The address to validate
 * @returns Boolean indicating if the address is valid
 */
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Convert a hexadecimal string to a decimal string
 * 
 * @param hex - The hexadecimal string (e.g., "0x...")
 * @returns The decimal representation as a string
 */
function hexToDecimal(hex: string): string {
  return BigInt(hex).toString();
}

/**
 * Format a WEI value to a more readable token format
 * 
 * @param wei - The amount in WEI as a string
 * @returns The formatted amount as a string
 */
function formatToToken(wei: string): string {
  const weiBigInt = BigInt(wei);
  const divisor = BigInt(10) ** BigInt(TOKEN_DECIMALS);
  const integerPart = weiBigInt / divisor;
  const fractionalPart = weiBigInt % divisor;
  
  // Pad fractional part with leading zeros to ensure it has 18 digits
  const fractionalString = fractionalPart.toString().padStart(TOKEN_DECIMALS, '0');
  
  return `${integerPart}.${fractionalString}`;
}

/**
 * Fetches the gas token balance for a given EVM address
 * 
 * @param address - The EVM address to check
 * @returns The balance information
 */
async function getGasTokenBalance(address: string) {
  console.log(`Fetching balance for ${address} from ${EVM_NODE_URL}...`);
  
  try {
    const response = await axios.post(
      EVM_NODE_URL,
      {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const balanceHex = response.data.result;
    const balanceWei = hexToDecimal(balanceHex);
    const balanceFormatted = formatToToken(balanceWei);
    
    return {
      address,
      balanceHex,
      balanceWei,
      balanceFormatted
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
    } else {
      console.error('Error fetching gas token balance:', error);
    }
    throw error;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName("check-gas-token-balance")
    .usage('$0 <evm-address>')
    .command('$0 <evm-address>', 'Checks gas token balance on an EVM-compatible node', (yargs) => {
      return yargs.positional('evm-address', {
        describe: 'EVM-compatible address to check balance for',
        type: 'string',
      });
    })
    .demandCommand(1, 'You must provide an EVM address.')
    .check((argv) => {
      const address = argv['evm-address'] as string;
      if (!isValidEthereumAddress(address)) {
        throw new Error('Invalid EVM address format.');
      }
      return true;
    })
    .help()
    .alias('h', 'help')
    .argv;

  const address = argv['evm-address'] as string;

  try {
    const balanceInfo = await getGasTokenBalance(address);
    
    console.log('\nBalance Details:');
    console.log('----------------');
    console.log(`  Address:    ${balanceInfo.address}`);
    console.log(`  Balance:    ${balanceInfo.balanceFormatted} Tokens`);
    console.log(`  (Wei):      ${balanceInfo.balanceWei}`);
    console.log(`  (Hex):      ${balanceInfo.balanceHex}`);
    console.log('----------------');
    
  } catch (error) {
    console.error('\nScript execution failed.');
    process.exit(1);
  }
}

main();
