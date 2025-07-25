import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, GasPrice, calculateFee, DeliverTxResponse } from "@cosmjs/stargate";

export interface SendTokenParams {
  mnemonic: string;
  prefix: string; // bech32 prefix for the signer chain ("celestia" | "init" | ...)
  rpcEndpoint: string;
  recipientAddress: string;
  amount: string; // integer amount in base denom (e.g. utia)
  denom: string; // base denom ("utia", "uinit", ...)
  gasPrice: string; // decimal string to feed into GasPrice (e.g. "0.1")
  gasLimit?: number; // default 200_000
  memo?: string;
}

/**
 * Generic helper that signs and broadcasts a bank/MsgSend using CosmJS.
 * All scripts that need to move tokens should depend on this instead of re-implementing.
 */
export async function sendTokens({
  mnemonic,
  prefix,
  rpcEndpoint,
  recipientAddress,
  amount,
  denom,
  gasPrice,
  gasLimit = 200_000,
  memo = "Sent via CosmJS",
}: SendTokenParams): Promise<DeliverTxResponse> {
  // create wallet and client
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix,
  });
  const [firstAccount] = await wallet.getAccounts();
  const senderAddress = firstAccount.address;

  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);

  const fee = calculateFee(gasLimit, GasPrice.fromString(`${gasPrice}${denom}`));

  const tokenAmount = { denom, amount };

  return client.sendTokens(senderAddress, recipientAddress, [tokenAmount], fee, memo);
}
