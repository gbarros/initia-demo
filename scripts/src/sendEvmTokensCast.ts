// This script sends tokens on the MiniEVM rollup using the `cast` CLI tool.
// It derives a private key from a mnemonic using the Cosmos derivation path
// and sends a LEGACY transaction, which may be required by some custom EVMs.

const { MnemonicKey } = require('@initia/initia.js');
const { execSync } = require('child_process');
const { bech32 } = require('bech32');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
require('dotenv').config();

async function sendEvmTokens() {
    // 1. Parse CLI arguments
    const argv = await yargs(hideBin(process.argv))
        .option('recipient', {
            alias: 'r',
            type: 'string',
            description: 'Recipient EVM address (0x...)',
            demandOption: true,
        })
        .option('amount', {
            alias: 'a',
            type: 'string',
            description: 'Amount to send in ETH (e.g., "0.01")',
            demandOption: true,
        })
        .option('rpc-url', {
            type: 'string',
            description: 'URL of the MiniEVM JSON-RPC endpoint',
            default: process.env.MINIEVM_RPC_URL || 'http://localhost:8545',
        })
        .help()
        .alias('help', 'h')
        .argv;

    // 2. Load mnemonic from environment
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('Please set the MNEMONIC environment variable (e.g., in a .env file).');
        process.exit(1);
    }

    const { recipient: recipientAddress, amount: amountInEth, 'rpc-url': rpcUrl } = argv;

    try {
        // 3. Derive the private key using the Cosmos path (m/44'/118'/...)
        const key = new MnemonicKey({ mnemonic, eth: false, coinType: 118  });
        const privateKey = '0x' + key.privateKey.toString('hex');
        console.log(`Derived Private Key: ${privateKey}`)
        // For logging purposes, derive addresses
        const senderInitAddress = key.accAddress;
        const decoded = bech32.decode(senderInitAddress);
        const senderEvmAddress = '0x' + Buffer.from(bech32.fromWords(decoded.words)).toString('hex');

        console.log(`Derived Sender Address (Initia): ${senderInitAddress}`);
        console.log(`Derived Sender Address (EVM):   ${senderEvmAddress}`);
        console.log(`Recipient Address (EVM):        ${recipientAddress}`);
        console.log(`Amount:                         ${amountInEth} ETH`);
        console.log(`RPC URL:                        ${rpcUrl}`);
        console.log('---');

        // 4. Construct and execute the `cast send` command with the --legacy flag
        const command = `cast send --rpc-url ${rpcUrl} --private-key ${privateKey} --value ${amountInEth}ether --legacy ${recipientAddress} --json`;

        console.log('Executing command:', command);
        const output = execSync(command, { encoding: 'utf-8' });
        
        const result = JSON.parse(output);

        if (result.transactionHash) {
            console.log('\n✅ Transaction sent successfully!');
            console.log('Transaction Hash:', result.transactionHash);
        } else {
            console.error('\n❌ Transaction may have failed. No transaction hash found.');
            console.log('Full output:', result);
        }

    } catch (e: unknown) {
        console.error('\n❌ Error sending tokens:');
        if (e && typeof e === 'object' && 'stderr' in e) {
            const errorWithStderr = e as { stderr: string | Buffer };
            console.error(errorWithStderr.stderr.toString());
        } else {
            console.error(e);
        }
        process.exit(1);
    }
}

sendEvmTokens();


