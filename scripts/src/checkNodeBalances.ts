import * as fs from 'fs';
import * as yargs from 'yargs';
import * as os from 'os';
import { getFormattedBalances } from './lib/balanceFetcher';
import { resolveMinitiaConfigPath, readMinitiaConfig } from './lib/weaveConfig';

async function displayBalancesForAddress(name: string, address: string) {
    try {
        const balances = await getFormattedBalances(address);
        if (balances.length > 0) {
            const balancesString = balances
                .map(b => `${b.formattedAmount} ${b.tokenName}`)
                .join(', ');
            console.log(`${name} (${address}): ${balancesString}`);
        } else {
            console.log(`${name} (${address}): No balance found`);
        }
    } catch (error) {
        console.error(`Could not fetch balance for ${name} (${address}):`, error);
    }
}



async function main() {
    const defaultPath = resolveMinitiaConfigPath();

    const argv = await yargs.option('file', {
        alias: 'f',
        description: `Path to the minitia.config.json file or a directory containing .weave/data/minitia.config.json. Defaults to ${defaultPath}`,
        type: 'string',
        default: defaultPath,
    }).help().alias('help', 'h').argv;

    const configPath = resolveMinitiaConfigPath(argv.file as string);
    console.log(`Using config file: ${configPath}`);
    
    const config = readMinitiaConfig(configPath);

    const initiaAddressNames = new Map<string, string>();
    const celestiaAddressNames = new Map<string, string>();

    // Collect addresses from system_keys
    for (const key in config.system_keys) {
        if (config.system_keys[key].l1_address) {
            initiaAddressNames.set(config.system_keys[key].l1_address, key);
        }
        if (config.system_keys[key].da_address) {
            celestiaAddressNames.set(config.system_keys[key].da_address, key);
        }
    }

    // Collect addresses from genesis_accounts
    config.genesis_accounts.forEach((account: { address: string }, index: number) => {
        if (!initiaAddressNames.has(account.address)) {
            initiaAddressNames.set(account.address, `genesis_account_${index}`);
        }
    });

    console.log("--- Checking Initia Balances ---");
    for (const [address, name] of initiaAddressNames.entries()) {
        await displayBalancesForAddress(name, address);
    }

    console.log("\n--- Checking Celestia Balances ---");
    for (const [address, name] of celestiaAddressNames.entries()) {
        await displayBalancesForAddress(name, address);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
