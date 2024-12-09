import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Web3ContextType } from '../type';
import { Web3Provider } from '@ethersproject/providers';


declare global {
    interface Window {
      ethereum?: {
        request: (request: { method: string }) => Promise<string[]>;
        isMetaMask?: boolean;
      };
    }
  }

export const useWeb3 = (): Web3ContextType => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  
  const AMOY_CHAIN_ID = 80002;
  const AMOY_RPC_URL = 'https://rpc-amoy.polygon.technology/';



  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const ethersProvider = new Web3Provider(window.ethereum);
          setProvider(ethersProvider);
          setSigner(ethersProvider.getSigner());
        }
      } catch (error) {
        console.error("Erreur de connexion", error);
      }
    }
  };

  const connect = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setAccount(accounts[0]);
        const ethersProvider = new Web3Provider(window.ethereum);
        setProvider(ethersProvider);
        setSigner(ethersProvider.getSigner());
      } catch (error) {
        console.error("Erreur de connexion", error);
      }
    } else {
      alert("Veuillez installer MetaMask!");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
  };

  return { account, connect, disconnect, provider, signer };
};