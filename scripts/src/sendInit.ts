import { sendTokens } from "./lib/tokenSender";
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables
dotenv.config();

const DEFAULT_RPC_ENDPOINT = "https://initia-testnet-rpc.polkachu.com:443"; // Public Initia testnet RPC endpoint
const DEFAULT_DENOM = "uinit";
const INIT_IN_UINIT = 1_000_000;

/**
 * Main function to execute the token sending process.
 */
async function main() {
    const argv = await yargs(hideBin(process.argv))
        .scriptName("send-init")
        .usage('$0 <recipient-address> <amount-in-init>')
        .command('$0 <recipient-address> <amount-in-init>', 'Sends INIT on the Initia Network', (yargs) => {
            return yargs
                .positional('recipient-address', {
                    describe: 'The Initia address of the recipient',
                    type: 'string',
                })
                .positional('amount-in-init', {
                    describe: 'The amount of INIT to send (e.g., 0.5, 10)',
                    type: 'number',
                });
        })
        .demandCommand(2, 'You must provide both a recipient address and an amount.')
        .check((argv) => {
            if (typeof argv['amount-in-init'] !== 'number' || argv['amount-in-init'] <= 0) {
                throw new Error('Amount must be a positive number.');
            }
            return true;
        })
        .help()
        .alias('h', 'help')
        .argv;

    const recipientAddress = argv['recipient-address'] as string;
    const amountInInit = argv['amount-in-init'] as number;

    const mnemonic = process.env.INITIA_SENDER_MNEMONIC;
    if (!mnemonic) {
        console.error("Error: INITIA_SENDER_MNEMONIC environment variable is not set.");
        process.exit(1);
    }

    const rpcEndpoint = process.env.INITIA_RPC_ENDPOINT || DEFAULT_RPC_ENDPOINT;
    const amountToSend = String(Math.floor(amountInInit * INIT_IN_UINIT));

    console.log("Preparing to send tokens...");
    console.log(`Using RPC endpoint: ${rpcEndpoint}`);

    try {
        const result = await sendTokens({
            mnemonic,
            prefix: "init",
            rpcEndpoint,
            recipientAddress,
            amount: amountToSend,
            denom: DEFAULT_DENOM,
            gasPrice: "0.1",
            gasLimit: 200_000,
            memo: "Sent via CosmJS",
        });

        console.log("\nTransaction successful!");
        console.log(`  Transaction Hash: ${result.transactionHash}`);
        console.log(`  Block Height: ${result.height}`);
    } catch (error) {
        console.error("\nTransaction failed:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();
