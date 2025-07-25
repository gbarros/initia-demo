import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as yargs from 'yargs';
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { sendTokens as broadcastTokens } from "./lib/tokenSender";
import { SigningStargateClient, GasPrice, calculateFee } from "@cosmjs/stargate";
import dotenv from 'dotenv';
import { getFormattedBalances, StandardizedBalance, isInitiaAddress, isCelestiaAddress } from './lib/balanceFetcher';

// Load environment variables
dotenv.config();

// Default RPC endpoints
const DEFAULT_INITIA_RPC = "https://initia-testnet-rpc.polkachu.com:443";
const DEFAULT_CELESTIA_RPC = "https://celestia-mocha-rpc.publicnode.com:443";

// Gas station addresses will be read from the Weave config file

// Token denominations and conversion factors
const INIT_DENOM = "uinit";
const TIA_DENOM = "utia";
const TOKEN_FACTOR = 1_000_000; // Both INIT and TIA use 6 decimal places

// Reserve amounts to keep for gas (in the smallest denomination)
const INITIA_GAS_RESERVE = 200000; // 0.2 INIT
const CELESTIA_GAS_RESERVE = 200000; // 0.2 TIA

/**
 * Function to get the minitia config path from a file path or directory
 */
function getMinitiaCfgPath(filePath: string): string {
    try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            return `${filePath}/.weave/data/minitia.config.json`;
        }
        return filePath;
    } catch (error) {
        // If path doesn't exist or there's an error, assume it's a file path
        return filePath;
    }
}

/**
 * Function to get the Weave config path from a file path or directory
 */
function getWeaveConfigPath(filePath: string): string {
    try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            return `${filePath}/.weave/config.json`;
        }
        return filePath;
    } catch (error) {
        // If path doesn't exist or there's an error, assume it's a file path
        return filePath;
    }
}

/**
 * Read gas station addresses from Weave config file
 */
function getGasStationAddresses(weaveHomePath: string): { initiaAddress: string, celestiaAddress: string, mnemonic: string } {
    try {
        // Locate config at <weaveHome>/.weave/config.json (preferred) or <weaveHome>/config.json
        let configPath = path.join(weaveHomePath, '.weave', 'config.json');
        if (!fs.existsSync(configPath)) {
            configPath = path.join(weaveHomePath, 'config.json');
        }
        console.log(`Looking for config at: ${configPath}`);
        const configFile = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configFile);
        
        if (!config.common?.gas_station) {
            throw new Error('Gas station configuration not found in Weave config');
        }
        
        return {
            initiaAddress: config.common.gas_station.initia_address,
            celestiaAddress: config.common.gas_station.celestia_address,
            mnemonic: config.common.gas_station.mnemonic
        };
    } catch (error) {
        throw new Error(`Failed to read gas station addresses: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Send tokens from a wallet to a destination address
 */
// Deprecated internal function kept for backward compat but delegates to shared util
async function sendTokens(
    mnemonic: string, 
    senderPrefix: string,
    recipientAddress: string, 
    amount: string, 
    denom: string, 
    rpcEndpoint: string,
    gasPrice: string
): Promise<string> {
    try {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: senderPrefix });
        const [firstAccount] = await wallet.getAccounts();
        const senderAddress = firstAccount.address;
        
        console.log(`Sender address: ${senderAddress}`);
        
        // delegate to shared util
        const result = await broadcastTokens({
                mnemonic,
                prefix: senderPrefix,
                rpcEndpoint,
                recipientAddress,
                amount,
                denom,
                gasPrice: gasPrice.toString(),
                gasLimit: 200000,
                memo: "Return to gas station",
            });
        
        console.log(`Transaction successful! Hash: ${result.transactionHash}`);
        return result.transactionHash;
    } catch (error) {
        console.error("Transaction failed:", error instanceof Error ? error.message : error);
        throw error;
    }
}

/**
 * Process an address to send tokens to gas station
 */
async function processAddress(
    name: string,
    address: string,
    mnemonic: string,
    gasStationAddress: string,
    rpcEndpoint: string,
    denom: string,
    gasReserve: number,
    prefix: string
): Promise<void> {
    try {
        // Get the current balance
        const balances = await getFormattedBalances(address);
        if (balances.length === 0) {
            console.log(`${name} (${address}): No balance found`);
            return;
        }

        // Find the token we're interested in
        const tokenBalance = balances.find(b => b.originalDenom === denom);
        if (!tokenBalance) {
            console.log(`${name} (${address}): No ${denom} balance found`);
            return;
        }

        // Calculate amount to send (total balance minus gas reserve)
        const balance = BigInt(tokenBalance.amount);
        const reserve = BigInt(gasReserve);
        
        if (balance <= reserve) {
            console.log(`${name} (${address}): Balance too low to transfer (${balance} <= ${reserve})`);
            return;
        }
        
        const amountToSend = (balance - reserve).toString();
        
        // Send the tokens
        await sendTokens(
            mnemonic,
            prefix,
            gasStationAddress,
            amountToSend,
            denom,
            rpcEndpoint,
            "0.1"
        );
        
        console.log(`${name} (${address}): Successfully sent ${BigInt(amountToSend) / BigInt(TOKEN_FACTOR)} tokens to gas station`);
    } catch (error) {
        console.error(`Error processing ${name} (${address}):`, error);
    }
}

/**
 * Derive the .weave-home directory from the minitia config path
 */
function deriveWeaveHome(minitiaCfgPath: string): string {
    // minitiaCfgPath typically ends with /.weave/data/minitia.config.json
    let dir = path.dirname(minitiaCfgPath); // .../data
    dir = path.dirname(dir); // .../.weave
    const weaveHome = path.dirname(dir); // .../.weave-home
    return weaveHome;
}

/**
 * Main function
 */
async function main() {
    const defaultPath = `${os.homedir()}/.weave/data/minitia.config.json`;
    const defaultWeaveHome = deriveWeaveHome(defaultPath);

    const argv = await yargs
        .option('file', {
            alias: 'f',
            description: `Path to the minitia.config.json file or a directory containing .weave/data/minitia.config.json. Defaults to ${defaultPath}`,
            type: 'string',
            default: defaultPath,
        })
        .option('weave-home', {
            description: 'Path to the .weave-home directory to read gas station addresses from',
            type: 'string',
            default: defaultWeaveHome,
        })
        .option('initia-rpc', {
            description: 'Initia RPC endpoint',
            type: 'string',
            default: process.env.INITIA_RPC_ENDPOINT || DEFAULT_INITIA_RPC,
        })
        .option('celestia-rpc', {
            description: 'Celestia RPC endpoint',
            type: 'string',
            default: process.env.CELESTIA_RPC_ENDPOINT || DEFAULT_CELESTIA_RPC,
        })
        .help()
        .alias('help', 'h')
        .argv;

    // Get gas station addresses from Weave config
    console.log(`Reading gas station addresses from ${argv['weave-home']}`);
    const weaveHome = argv['weave-home'] as string || deriveWeaveHome(argv.file as string);
    const gasStation = getGasStationAddresses(weaveHome);
    console.log(`Found gas station addresses:\n  Initia: ${gasStation.initiaAddress}\n  Celestia: ${gasStation.celestiaAddress}`);
    
    // Get minitia config
    const minitiaCfgPath = getMinitiaCfgPath(argv.file as string);
    console.log(`\nUsing minitia config file: ${minitiaCfgPath}`);
    
    const configFile = fs.readFileSync(minitiaCfgPath, 'utf-8');
    const config = JSON.parse(configFile);

    // Build maps address → { name, mnemonic }
    const initiaAddressInfo = new Map<string, { name: string; mnemonic?: string }>();
    const celestiaAddressInfo = new Map<string, { name: string; mnemonic?: string }>();

    // Collect addresses from system_keys (they have mnemonics)
    for (const key in config.system_keys) {
        const sk = config.system_keys[key];
        if (sk.l1_address) {
            initiaAddressInfo.set(sk.l1_address, { name: key, mnemonic: sk.mnemonic });
        }
        if (sk.da_address) {
            celestiaAddressInfo.set(sk.da_address, { name: key, mnemonic: sk.mnemonic });
        }
    }

    // Collect addresses from genesis_accounts (no known mnemonic, so read-only)
    config.genesis_accounts.forEach((account: { address: string }, index: number) => {
        if (!initiaAddressInfo.has(account.address)) {
            initiaAddressInfo.set(account.address, { name: `genesis_account_${index}` });
        }
    });

    // Process Initia addresses
    console.log("--- Processing Initia Addresses ---");
    for (const [address, info] of initiaAddressInfo.entries()) { const {name, mnemonic} = info;
        // Skip the gas station address itself
        if (address === gasStation.initiaAddress) {
            console.log(`${name} (${address}): Skipping gas station address`);
            continue;
        }
        
        await processAddress(
            name,
            address,
            mnemonic!,
            gasStation.initiaAddress,
            argv['initia-rpc'] as string,
            INIT_DENOM,
            INITIA_GAS_RESERVE,
            "init"
        );
    }

    // Process Celestia addresses
    console.log("\n--- Processing Celestia Addresses ---");
    for (const [address, info] of celestiaAddressInfo.entries()) { const {name, mnemonic} = info;
        // Skip the gas station address itself
        if (address === gasStation.celestiaAddress) {
            console.log(`${name} (${address}): Skipping gas station address`);
            continue;
        }
        
        await processAddress(
            name,
            address,
            mnemonic!,
            gasStation.celestiaAddress,
            argv['celestia-rpc'] as string,
            TIA_DENOM,
            CELESTIA_GAS_RESERVE,
            "celestia"
        );
    }

    console.log("\nAll transfers completed!");
}

main().catch(console.error);
