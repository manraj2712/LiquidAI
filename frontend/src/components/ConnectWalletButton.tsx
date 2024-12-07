"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useSwitchChain } from "wagmi";
import { Button } from "./ui/button";

interface ConnectWalletButtonProps {
  className?: string;
  btnTextStyle?: string;
  chainId: number;
}
const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  className,
  chainId,
}) => {
  const [isNetworkSupportedByWallet, setIsNetworkSupportedByWallet] =
    useState(true);

  const { switchChain } = useSwitchChain();
  const handleSwitchNetwork = () => {
    switchChain(
      { chainId },
      {
        onSuccess: () => {
          setIsNetworkSupportedByWallet(true);
        },
        onError: (error) => {
          console.log({ error });
        },
      }
    );
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal: isOpenConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return connected ? (
          <Button
            title={"Switch Network"}
            onClick={handleSwitchNetwork}
            type="button"
            className="text-white"
            disabled={!isNetworkSupportedByWallet}
          >
            {`Connected to ${chain?.name}`}
          </Button>
        ) : (
          <Button
            onClick={isOpenConnectModal}
            type="button"
            className="text-white"
          >
            {"Connect Wallet"}
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
};
export default ConnectWalletButton;
