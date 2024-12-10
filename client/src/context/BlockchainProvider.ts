// import React, { useContext, useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { Web3Provider as EthersWeb3Provider } from '@ethersproject/providers';

// type Web3ContextType = {
//     account: string | null;
//     connect: () => void;
//     disconnect: () => void;
//     provider: any;
//     signer: any;
// }

// const Web3Context = React.createContext<Web3ContextType>({
//     account: null,
//     connect: () => {},
//     disconnect: () => {},
//     provider: null,
//     signer: null,
// })

// type Web3ContextProviderProps = {
//     children: React.ReactNode
// }

// export function Web3ContextProvider(props: Web3ContextProviderProps) {
//     const [account, setAccount] = useState<string | null>(null);
//     const [provider, setProvider] = useState<EthersWeb3Provider | null>(null);
//     const [signer, setSigner] = useState<ethers.Signer | null>(null);

//     useEffect(() => {
//         checkConnection();

//         if (window.ethereum) {
//         window.ethereum.on?.('accountsChanged', (accounts: string[]) => {
//             setAccount(accounts[0] || null);
//         });
//         }
//     }, []);

//     const checkConnection = async () => {
//         try {
//             if (window.ethereum) {
                
//             }
//             const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//             if (accounts.length > 0) {
//             setAccount(accounts[0]);
//             const ethersProvider = new EthersWeb3Provider(window.ethereum);
//             setProvider(ethersProvider);
//             setSigner(ethersProvider.getSigner());
//             }
//         } catch (error) {
//             console.error('Erreur lors de la connexion', error);
//         }
//     };

//     const connect = async () => {
//         if (window.ethereum) {
//         try {
//             await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//             setAccount(accounts[0]);
//             const ethersProvider = new EthersWeb3Provider(window.ethereum);
//             setProvider(ethersProvider);
//             setSigner(ethersProvider.getSigner());
//         } catch (error) {
//             console.error('Erreur lors de la connexion', error);
//         }
//         } else {
//         alert('Veuillez installer MetaMask!');
//         }
//     };

//     const disconnect = () => {
//         setAccount(null);
//         setProvider(null);
//         setSigner(null);
//     };

//     return (
//         <Web3Context.Provider
//                 value={{ account, connect, disconnect, provider, signer }}>
//         {children}
//         </Web3Context.Provider>
//     );
// }

// export function Web3ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
// };

// export const useWeb3Context = (): Web3ContextType => {
//   const context = useContext(Web3Context);
//   if (!context) {
//     throw new Error('useWeb3Context must be used within a Web3Provider');
//   }
//   return context;
// };
