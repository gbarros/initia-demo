const { MnemonicKey } = require('@initia/initia.js');
const { bech32 } = require('bech32');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { ethers } = require('ethers');
require('dotenv').config();

async function sendEvmTokensRaw() {
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
        console.error('Please set the MNEMONIC environment variable.');
        process.exit(1);
    }

    const { recipient: recipientAddress, amount: amountInEth, 'rpc-url': rpcUrl } = argv;

    try {
        // 3. Set up provider and wallet
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const key = new MnemonicKey({ mnemonic });
        const wallet = new ethers.Wallet(key.privateKey, provider);

        const senderEvmAddress = await wallet.getAddress();
        console.log(`Sender Address (EVM):   ${senderEvmAddress}`);
        console.log(`Recipient Address (EVM):  ${recipientAddress}`);
        console.log(`Amount:                   ${amountInEth} ETH`);
        console.log(`RPC URL:                  ${rpcUrl}`);
        console.log('---');

        // 4. Get necessary transaction parameters
        const nonce = await provider.getTransactionCount(senderEvmAddress, 'latest');
        const feeData = await provider.getFeeData();
        const chainId = (await provider.getNetwork()).chainId;

        console.log(`Nonce: ${nonce}`);
        console.log(`Gas Price: ${ethers.formatUnits(feeData.gasPrice, 'gwei')} gwei`);
        console.log(`Chain ID: ${chainId}`);

        // 5. Construct the transaction object
        const tx = {
            type: 0, // Legacy transaction
            to: recipientAddress,
            value: ethers.parseEther(amountInEth),
            nonce: nonce,
            gasLimit: 21000, // Standard gas limit for a simple ETH transfer
            gasPrice: feeData.gasPrice,
            chainId: chainId,
        };

        console.log('\nConstructed Transaction:', tx);

        // 6. Sign the transaction
        const signedTx = await wallet.signTransaction(tx);
        console.log('\nSigned Transaction:', signedTx);

        // 7. Send the raw transaction
        console.log('\nBroadcasting raw transaction...');
        const txResponse = await provider.broadcastTransaction(signedTx);
        
        console.log('\n✅ Transaction sent successfully!');
        console.log('Transaction Hash:', txResponse.hash);

        // 8. Wait for confirmation
        console.log('Waiting for transaction to be mined...');
        const receipt = await txResponse.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);

    } catch (error) {
        console.error('\n❌ An unexpected error occurred:');
        console.error(error);
        process.exit(1);
    }
}

sendEvmTokensRaw();
