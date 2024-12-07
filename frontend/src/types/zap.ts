import { HexString } from "./string";

export enum TokenType {
  None,
  ERC20,
  ERC721,
}

export enum InputTransferType {
  SafeTransferAndApprove, // Safely transfer to contract and then approve to another address
  SafeTransferToSpender, // Safely transfer directly to the approveTo address
  ApproveOnly, // Tokens are already in the contract, just approve the spender
  TransferFromContract, // Tokens are already in the contract, just transfer to the approveTo address
}

export enum OutputTransferType {
  ReceiveAndTransfer, // Token comes into the contract first, then is transferred to the recipient
  DirectTransferToRecipient, // Token is already transferred directly to the recipient
  UseMinAndReturnRemainder, // Use the minimum required amount for the next step, and return the leftover to the sender
  UseAllForNextStep, // Retain all tokens for use in the next input step
}

export type InputToken = {
  tokenType: TokenType;
  transferType: InputTransferType;
  tokenAddress: HexString;
  approveTo: HexString;
  amount: bigint;
  tokenId: bigint;
};
export type OutputToken = {
  tokenType: TokenType;
  transferType: OutputTransferType;
  tokenAddress: HexString;
  recipient: HexString;
  minReturn: bigint;
  tokenId: bigint;
};

export type ZapData = {
  callTo: HexString;
  callData: HexString;
  isDelegateCall: boolean;
  nativeValue: bigint;
  input: InputToken[];
  output: OutputToken[];
};
