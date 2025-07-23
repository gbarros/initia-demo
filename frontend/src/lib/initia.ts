// This file contains the previous attempt to use @initia/initia.js directly.
// It is preserved for reference but is not currently used in the application.

import { RESTClient, MsgExecuteContract } from '@initia/initia.js';
import { TSHIRT_CONTRACT_ADDRESS } from './contract';

export const unused_buyShirt_v1 = async (address: string) => {
  try {
    // This approach is incorrect because RESTClient is for Cosmos SDK chains,
    // not EVM chains like Anvil.
    const rest = new RESTClient('http://127.0.0.1:8545');

    const tiaUsdPrice: string = await rest.wasm.contractQuery(TSHIRT_CONTRACT_ADDRESS, { get_tia_price: {} });
    const tshirtPriceUsd: string = await rest.wasm.contractQuery(TSHIRT_CONTRACT_ADDRESS, { tshirt_price_usd: {} });

    const priceInTia = (BigInt(tshirtPriceUsd) * BigInt(1e18)) / BigInt(tiaUsdPrice);

    const msg = new MsgExecuteContract(
      address, // sender
      TSHIRT_CONTRACT_ADDRESS, // contract
      { mint: { to: address } }, // msg
      { uinit: priceInTia.toString() } // funds
    );

    console.log('This function is not wired up to a wallet and will not send a transaction.', msg);

  } catch (error: any) {
    console.error('Purchase failed:', error);
    alert(`Purchase failed: ${error.message}`);
  }
};
