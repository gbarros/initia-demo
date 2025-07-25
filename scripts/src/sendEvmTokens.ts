import { AccAddress,  MnemonicKey, RESTClient, Wallet, MsgCall, Fee, Coins, MsgSend } from "@initia/initia.js";



const { bech32 } = require('bech32');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { parseEther } = require('ethers');
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
        .option('rest-url', {
            type: 'string',
            description: 'URL of the Initia REST API endpoint for the rollup',
            default: process.env.INITIA_REST_URL || 'http://localhost:1317',
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

    const { recipient: recipientAddress, amount: amountInEth, 'rest-url': restURL } = argv;

    try {
        // 2. Derive the private key using the Cosmos path (m/44'/118'/...)
        // This is the key for the account funded by the weave gas station.
        const key = new MnemonicKey({ mnemonic });
        // const privateKey = '0x' + key.privateKey.toString('hex');

        // For logging purposes, derive the sender's EVM address from the Initia address
        const senderInitAddress = key.accAddress;
        // const decoded = bech32.decode(senderInitAddress);
        // const senderEvmAddress = '0x' + Buffer.from(bech32.fromWords(decoded.words)).toString('hex');

        console.log(`Derived Sender Address (Initia): ${senderInitAddress}`);
        // console.log(`Derived Sender Address (EVM):   ${senderEvmAddress}`);
        console.log(`Recipient Address (EVM):        ${recipientAddress}`);
        console.log(`Amount:                         ${amountInEth} ETH`);
        console.log(`REST URL:                        ${restURL}`);
        console.log('---');

        // 3. Set up Initia.js wallet and REST client
        const rest = new RESTClient(restURL);

        const wallet = new Wallet(rest, key);

        // 4. Construct the EVM transaction message (MsgExec)
        const amountInWei = parseEther(amountInEth).toString();
        const msg = new MsgSend(
            key.accAddress, // The sender's Initia address
            AccAddress.fromHex(recipientAddress),// recipientAddress, // The recipient's EVM address
            `${amountInWei}GAB`,      // The amount in wei
        );

        // 5. Create, sign, and broadcast the transaction
        console.log('Broadcasting transaction to the MiniEVM...');

        // Manually specify the fee to bypass estimation, which seems to be the issue.
        const fee = new Fee(
            300000, // Gas limit, increased for safety
            new Coins({ GAB: 0 }) // Fee amount in the smallest denomination
        );

        const tx = await wallet.createAndSignTx({ msgs: [msg], fee });
        const result = await rest.tx.broadcast(tx);

        console.log('Transaction result:', result);
        // if (result.code === 0) {
        //     console.log('\n✅ Transaction sent successfully!');
        //     console.log('Transaction Hash:', result.txhash);
        //     console.log('Block Height:', result.height);
        // } else {
        //     console.error('\n❌ Transaction failed:');
        //     console.error(`Error code: ${result.code}`);
        //     console.error(`Raw log: ${result.raw_log}`);
        // }

    } catch (e: unknown) {
        console.error('\n❌ An unexpected error occurred:');
        // if (e instanceof Error) {
        //     console.error(e.message);
        // } else {
        // }
        console.error(e);
        process.exit(1);
    }
}

sendEvmTokens();

export {}; // To treat this file as a module

