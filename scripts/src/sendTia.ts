import { sendTokens } from "./lib/tokenSender";
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables
dotenv.config();

const DEFAULT_RPC_ENDPOINT = "https://celestia-mocha-rpc.publicnode.com:443";
const DEFAULT_DENOM = "utia";
const TIA_IN_UTIA = 1_000_000;

/**
 * Main function to execute the token sending process.
 */
async function main() {
    const argv = await yargs(hideBin(process.argv))
        .scriptName("send-tia")
        .usage('$0 <recipient-address> <amount-in-tia>')
        .command('$0 <recipient-address> <amount-in-tia>', 'Sends TIA on the Celestia Network', (yargs) => {
            return yargs
                .positional('recipient-address', {
                    describe: 'The Celestia address of the recipient',
                    type: 'string',
                })
                .positional('amount-in-tia', {
                    describe: 'The amount of TIA to send (e.g., 0.5, 10)',
                    type: 'number',
                });
        })
        .demandCommand(2, 'You must provide both a recipient address and an amount.')
        .check((argv) => {
            if (typeof argv['amount-in-tia'] !== 'number' || argv['amount-in-tia'] <= 0) {
                throw new Error('Amount must be a positive number.');
            }
            return true;
        })
        .help()
        .alias('h', 'help')
        .argv;

    const recipientAddress = argv['recipient-address'] as string;
    const amountInTia = argv['amount-in-tia'] as number;

    const mnemonic = process.env.SENDER_MNEMONIC;
    if (!mnemonic) {
        console.error("Error: SENDER_MNEMONIC environment variable is not set.");
        process.exit(1);
    }

    const rpcEndpoint = process.env.CELESTIA_RPC_ENDPOINT || DEFAULT_RPC_ENDPOINT;
    const amountToSend = String(Math.floor(amountInTia * TIA_IN_UTIA));

    console.log("Preparing to send tokens...");
    console.log(`Using RPC endpoint: ${rpcEndpoint}`);

    try {
        const result = await sendTokens({
            mnemonic,
            prefix: "celestia",
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
