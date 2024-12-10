import React, { createContext, useState, useContext, useEffect } from 'react';
import { Web3ContextType } from '../type';
import { ethers } from 'ethers';

// Déclaration globale pour ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string }) => Promise<string[]>;
      isMetaMask?: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Création du contexte
const Web3Context = createContext<Web3ContextType>({
  account: null,
  connect: async () => {},
  disconnect: () => {},
  signer: null
});

type ContextProviderProps = {
    children: React.ReactNode;
  };

// Provider component
export function Web3ContextProvider(props:ContextProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  // Vérification de la connexion initiale
  useEffect(() => {
    checkConnection();
    
    // Gestion des événements de changement de compte et de réseau
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnect();
        }
      };

      const handleChainChanged = () => {
        // Recharger la page ou réinitialiser l'état
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Nettoyage des écouteurs
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const provider =  new ethers.BrowserProvider(window.ethereum);
          setSigner(provider.getSigner());
        }
      } catch (error) {
        console.error("Erreur de connexion", error);
      }
    }
  };

  const connect = async () => {
    if (window.ethereum) {
      try {
        // Demander l'autorisation de connexion des comptes
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Récupérer les comptes
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        // Vérifier que des comptes sont disponibles
        if (accounts.length === 0) {
          throw new Error("Aucun compte n'a été autorisé");
        }

        // Créer le provider Ethers

        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Obtenir le signer
        const signerInstance = provider.getSigner();

        // Vérifier le réseau (optionnel)
        // const network = await provider.getNetwork();
        const network = await provider.send("eth_chainId", []);

        const AMOY_CHAIN_ID = 80002; // ID du réseau Polygon Amoy

        if (network.chainId !== AMOY_CHAIN_ID) {
          try {
            // Tentative de changement de réseau
            await (window.ethereum as any).request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${AMOY_CHAIN_ID.toString(16)}` }]
            });
          } catch (switchError: any) {
            // Si le réseau n'est pas encore ajouté, on propose de l'ajouter
            if (switchError.code === 4902) {
              try {
                await (window.ethereum as any).request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: `0x${AMOY_CHAIN_ID.toString(16)}`,
                    chainName: 'Polygon Amoy Testnet',
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18
                    },
                    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                    blockExplorerUrls: ['https://www.oklink.com/amoy']
                  }]
                });
              } catch (addError) {
                console.error("Impossible d'ajouter le réseau Amoy", addError);
                throw new Error("Veuillez ajouter manuellement le réseau Polygon Amoy");
              }
            } else {
              console.error("Erreur de changement de réseau", switchError);
              throw new Error("Veuillez vous connecter au réseau Polygon Amoy");
            }
          }
        }

        // Mettre à jour les états
        setAccount(accounts[0]);
        setSigner(signerInstance);

      } catch (error) {
        console.error("Erreur de connexion", error);
        alert(`Erreur de connexion : ${(error as Error).message}`);
      }
    } else {
      alert("Veuillez installer MetaMask!");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
  };

  return (
    <Web3Context.Provider value={{ 
      account, 
      connect, 
      disconnect, 
      signer 
    }}>
      {props.children}
    </Web3Context.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte Web3
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 doit être utilisé à l\'intérieur d\'un Web3ContextProvider');
  }
  return context;
};