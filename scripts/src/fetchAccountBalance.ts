/**
 * Script to fetch account balances from different blockchains (Initia/Celestia)
 */

import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
    getFormattedBalances,
    isInitiaAddress,
    isCelestiaAddress,
    INITIA_API_ENDPOINTS,
    CELESTIA_API_ENDPOINTS,
} from './lib/balanceFetcher';

// Load environment variables
dotenv.config();

/**
 * Main function to execute the script
 */
async function main() {
    const allNetworks = [
        ...Object.keys(INITIA_API_ENDPOINTS),
        ...Object.keys(CELESTIA_API_ENDPOINTS)
    ];

    const argv = await yargs(hideBin(process.argv))
        .scriptName("fetch-balance")
        .usage('$0 <account-address> [network]')
        .command('$0 <account-address> [network]', 'Fetches account balances from Initia and Celestia blockchains', (yargs) => {
            return yargs
                .positional('account-address', {
                    describe: 'Blockchain account address (starting with "init" or "celestia")',
                    type: 'string',
                })
                .positional('network', {
                    describe: 'Network name (optional)',
                    type: 'string',
                    choices: allNetworks,
                });
        })
        .demandCommand(1, 'You must provide an account address.')
        .check((argv) => {
            const address = argv['account-address'] as string;
            if (!isInitiaAddress(address) && !isCelestiaAddress(address)) {
                throw new Error('Invalid address format. Must start with "init" or "celestia".');
            }
            return true;
        })
        .help()
        .alias('h', 'help')
        .argv;

    const address = argv['account-address'] as string;
    const network = argv.network as string | undefined;

    console.log(`Fetching balances for ${address}...\n`);

    try {
        const formattedBalances = await getFormattedBalances(address, network);

        if (formattedBalances.length > 0) {
            console.log('Balance Information:');
            console.log('--------------------');
            formattedBalances.forEach(balance => {
                console.log(`  Token:         ${balance.tokenName}`);
                if (balance.formattedAmount) {
                    console.log(`  Amount:        ${balance.formattedAmount}`);
                }
                console.log(`  Denom:         ${balance.originalDenom}`);
                console.log(`  Raw Amount:    ${balance.amount}`);
                if (balance.additionalInfo) {
                    Object.entries(balance.additionalInfo).forEach(([key, value]) => {
                        console.log(`  ${key.charAt(0).toUpperCase() + key.slice(1)}:      ${value}`);
                    });
                }
                console.log('--------------------');
            });
        } else {
            console.log('No balances found for this address.');
        }
    } catch (error) {
        console.error('\nScript execution failed:');
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();
