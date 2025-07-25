/**
 * Shared library for fetching and formatting account balances from Initia and Celestia.
 */

import axios from 'axios';

// API endpoint configurations
export const INITIA_API_ENDPOINTS: Record<string, string> = {
  'testnet': 'https://rest.testnet.initia.xyz',
  'mainnet': 'https://rest.mainnet.initia.xyz'
};

export const CELESTIA_API_ENDPOINTS: Record<string, string> = {
  'mocha-4': 'https://api-mocha-4.celenium.io',
  'mainnet': 'https://api-mainnet.celenium.io',
  'arabica-11': 'https://api-arabica-11.celenium.io'
};

// Default networks
export const DEFAULT_INITIA_NETWORK = 'testnet';
export const DEFAULT_CELESTIA_NETWORK = 'mocha-4';
const PAGINATION_LIMIT = 100;

// Token mapping for Initia denoms
export const INITIA_TOKEN_MAPPING: Record<string, string> = {
  'move/39be751fb1af0a64eda97ce59f569ef903ac7a90d0d44d40287b059024f363c0': 'sINIT',
  'move/9017f312a3df7e612d3ca453bee0bbc6c93b040861d235b8ad0406d3674e1abe': 'nINIT',
  'uinit': 'INIT'
};

// Basic interfaces for balance data
export interface TokenBalance {
  denom: string;
  amount: string;
}

export interface InitiaBalanceResponse {
  balances: TokenBalance[];
  pagination: {
    next_key: string | null;
    total: string;
  };
}

export interface CelestiaBalanceResponse {
  id: number;
  first_height: number;
  last_height: number;
  hash: string;
  balance: {
    currency: string;
    spendable: string;
    delegated: string;
    unbonding: string;
  };
}

// Standard output format regardless of chain
export interface StandardizedBalance {
  tokenName: string;
  originalDenom: string;
  amount: string;
  formattedAmount?: string;
  network: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Look up a token name from its denom
 */
export function lookupTokenName(denom: string): string {
  return INITIA_TOKEN_MAPPING[denom] || denom;
}

/**
 * Check if an address is an Initia address
 */
export function isInitiaAddress(address: string): boolean {
  return address.startsWith('init');
}

/**
 * Check if an address is a Celestia address
 */
export function isCelestiaAddress(address: string): boolean {
  return address.startsWith('celestia');
}

/**
 * Fetches Initia account balances for the specified address
 */
export async function fetchInitiaBalance(address: string, network: string = DEFAULT_INITIA_NETWORK): Promise<InitiaBalanceResponse | null> {
  if (!INITIA_API_ENDPOINTS[network]) {
    console.error(`Invalid Initia network: ${network}.`);
    return null;
  }
  
  let apiEndpoint = process.env.INITIA_API_ENDPOINT || INITIA_API_ENDPOINTS[network];
  const url = `${apiEndpoint}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=${PAGINATION_LIMIT}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        // This is an expected case for new accounts, so we don't log an error.
        return null;
    }
    console.error(`Error fetching Initia balance for ${address} from ${url}:`, error);
    return null;
  }
}

/**
 * Fetches Celestia account balances for the specified address
 */
export async function fetchCelestiaBalance(address: string, network: string = DEFAULT_CELESTIA_NETWORK): Promise<CelestiaBalanceResponse | null> {
  if (!CELESTIA_API_ENDPOINTS[network]) {
    console.error(`Invalid Celestia network: ${network}.`);
    return null;
  }
  
  let apiEndpoint = process.env.CELESTIA_API_ENDPOINT || CELESTIA_API_ENDPOINTS[network];
  const url = `${apiEndpoint}/v1/address/${address}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Expected case for new accounts.
        return null;
    }
    console.error(`Error fetching Celestia balance for ${address} from ${url}:`, error);
    return null;
  }
}

/**
 * Format Initia balances to standard format
 */
export function formatInitiaBalances(balances: TokenBalance[]): StandardizedBalance[] {
  return balances.map(balance => {
    const amountNumber = parseFloat(balance.amount);
    const tokenName = lookupTokenName(balance.denom);
    
    if (balance.denom === 'uinit') {
      const formattedAmount = (amountNumber / 1_000_000).toFixed(6);
      return {
        tokenName,
        originalDenom: balance.denom,
        amount: balance.amount,
        formattedAmount,
        network: 'initia'
      };
    }
    
    return {
      tokenName: tokenName !== balance.denom ? tokenName : 'Unknown',
      originalDenom: balance.denom,
      amount: balance.amount,
      network: 'initia'
    };
  });
}

/**
 * Format Celestia balances to standard format
 */
export function formatCelestiaBalances(celestiaData: CelestiaBalanceResponse): StandardizedBalance[] {
  const { balance } = celestiaData;
  const amountNumber = parseFloat(balance.spendable);
  const formattedAmount = (amountNumber / 1_000_000).toFixed(6);
  
  return [{
    tokenName: 'TIA',
    originalDenom: balance.currency,
    amount: balance.spendable,
    formattedAmount,
    network: 'celestia',
    additionalInfo: {
      delegated: balance.delegated,
      unbonding: balance.unbonding
    }
  }];
}

/**
 * A high-level function to fetch and format balances for a given address.
 */
export async function getFormattedBalances(address: string, network?: string): Promise<StandardizedBalance[]> {
    if (isInitiaAddress(address)) {
        const initiaNetwork = network || DEFAULT_INITIA_NETWORK;
        const balanceData = await fetchInitiaBalance(address, initiaNetwork);
        if (balanceData && balanceData.balances.length > 0) {
            return formatInitiaBalances(balanceData.balances);
        }
    } else if (isCelestiaAddress(address)) {
        const celestiaNetwork = network || DEFAULT_CELESTIA_NETWORK;
        const balanceData = await fetchCelestiaBalance(address, celestiaNetwork);
        if (balanceData) {
            return formatCelestiaBalances(balanceData);
        }
    }
    return [];
}
