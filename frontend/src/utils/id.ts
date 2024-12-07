import { HexString } from "@/types/string";
import { stringToHex } from "viem";
export const generateMessageId = () => {
  return `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const generateBytes32TxnId = (account: string): HexString => {
  const txId = `${account.slice(2, 6)}-${account.slice(-4)}-${Date.now()}`;
  return stringToHex(txId, { size: 32 });
};
