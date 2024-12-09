import React from 'react';
import { Button } from 'antd';
import { Web3ContextType } from './type';

interface ConnectWalletProps {
  web3Context: Web3ContextType;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ web3Context }) => {
  const { account, connect, disconnect } = web3Context;

  return (
    <div>
      {account ? (
        <div>
          <span>Connecté: {account}</span>
          <Button onClick={disconnect}>Déconnexion</Button>
        </div>
      ) : (
        <Button onClick={connect}>Connecter Wallet</Button>
      )}
    </div>
  );
};