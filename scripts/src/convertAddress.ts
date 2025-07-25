import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import converter = require('bech32-converting');

// Setup yargs to parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('address', {
    alias: 'a',
    description: 'The address to convert (supports EVM 0x... and Initia init1... formats)',
    type: 'string',
    demandOption: true,
  })
  .help()
  .alias('help', 'h')
  .parseSync();

function convertEvmToInitia(evmAddress: string): string {
  if (evmAddress.length !== 42) {
    throw new Error(`Invalid EVM address length: expected 42, got ${evmAddress.length}.`);
  }
  try {
    return converter('init').toBech32(evmAddress);
  } catch (error) {
    throw new Error(`Failed to convert EVM address: ${error}`);
  }
}

function convertInitiaToEvm(initiaAddress: string): string {
  try {
    return converter('init').toHex(initiaAddress);
  } catch (error) {
    throw new Error(`Failed to convert Initia address: ${error}`);
  }
}

async function main() {
  try {
    const address = argv.address;

    if (address.startsWith('0x')) {
      console.log(`Converting EVM address: ${address}`);
      const initiaAddress = convertEvmToInitia(address);
      console.log(`Initia address: ${initiaAddress}`);
    } else if (address.startsWith('init1')) {
      console.log(`Converting Initia address: ${address}`);
      const evmAddress = convertInitiaToEvm(address);
      console.log(`EVM address: ${evmAddress}`);
    } else {
      throw new Error('Invalid address format: must start with "0x" or "init1".');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred.');
    }
    process.exit(1);
  }
}

main();
