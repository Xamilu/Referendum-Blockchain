import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProposalsABI from '../../../back/artifacts/contracts/Proposals.sol/Proposals.json';
import PropositionABI from '../../../back/artifacts/contracts/Proposition.sol/Proposition.json';
import { Proposal } from '../type';

export const useContracts = (signer:any) => {
  const [proposalsContract, setProposalsContract] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [proposals, setProposals] = useState<string[]>([]);  // Liste des propositions

 
  // Fonction pour créer une proposition
  const createProposal = async (title: string, description: string) => {
    if (!proposalsContract || !signer || !provider) {
      console.error("Contrat, signer ou provider non initialisé");
      return null;
    }

    try {
      const network = await provider.getNetwork();  // Utilisation explicite du provider
      const AMOY_CHAIN_ID = 80002;
      const networkChainId = Number(network.chainId);

      // Vérification du réseau
      if (networkChainId !== AMOY_CHAIN_ID) {
        throw new Error("Veuillez vous connecter au réseau Polygon Amoy");
      }

      const tx = await proposalsContract.createProposition(title, description);
      const receipt = await tx.wait();
      console.log("Transaction réussie:", receipt);
      return receipt;
    } catch (error) {
      console.error("Erreur lors de la création de la proposition", error);
      return null;
    }
  };

  // Fonction pour récupérer les propositions
  const fetchProposals = async (): Promise<string[]> => {
    console.log("proposalsContractBefore",proposalsContract);
    console.log('tmp',await proposalsContract.getAllPropositions())

    if (!proposalsContract) return [];
    console.log("proposalsContractAfter",proposalsContract);

    try {
      const proposals = await proposalsContract.getAllPropositions();
      console.log("Propositions récupérées:", proposals);
      return proposals;
    } catch (error) {
      console.error("Erreur lors de la récupération des propositions", error);
      return [];
    }
  };

  // Fonction pour récupérer les détails d'une proposition
  const fetchProposalDetails = async (proposalAddress: string): Promise<Proposal | null> => {
    if (!signer) return null;
    try {
      const propositionContract = new ethers.Contract(proposalAddress, PropositionABI.abi, signer);
      const details = await propositionContract.getPropositionDetails();
      return {
        creator: details[0],
        title: details[1],
        description: details[2],
        startTime: details[3].toNumber(),
        votingDuration: details[4].toNumber(),
        votesFor: details[5].toNumber(),
        votesAgainst: details[6].toNumber(),
        isActive: details[7],
        totalVotes: details[8].toNumber(),
        percentFor: details[9].toNumber(),
        percentAgainst: details[10].toNumber()
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de la proposition", error);
      return null;
    }
  };
  // Fonction pour voter pour une proposition
  const voteForProposal = async (proposalAddress: string) => {
    if (!signer) return null;
    try {
      const propositionContract = new ethers.Contract(proposalAddress, PropositionABI.abi, signer);
      const tx = await propositionContract.voteFor();
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Erreur lors du vote", error);
      return null;
    }
  };

  // Fonction pour voter contre une proposition
  const voteAgainstProposal = async (proposalAddress: string) => {
    if (!signer) return null;
    try {
      const propositionContract = new ethers.Contract(proposalAddress, PropositionABI.abi, signer);
      const tx = await propositionContract.voteAgainst();
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Erreur lors du vote", error);
      return null;
    }
  };

   // Initialiser le provider et signer depuis MetaMask (ou un autre portefeuille)
   useEffect(() => {
    const initializeSigner = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });

          const _provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(_provider);

          const signer = await _provider.getSigner();
          const contract = new ethers.Contract(
            '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',  // Remplace avec l'adresse de ton contrat
            ProposalsABI.abi,
            signer
          );
          setProposalsContract(contract);
        } catch (error) {
          console.error("Erreur de connexion à MetaMask", error);
        }
      } else {
        console.error("MetaMask n'est pas détecté. Veuillez installer MetaMask.");
      }
    };

    initializeSigner();
  }, []);  // Le useEffect ne se lance qu'une seule fois au montage du composant

  // Utiliser un autre useEffect pour récupérer les propositions après l'initialisation du contrat
  useEffect(() => {
    if (proposalsContract) {
        console.log("proposalsContract",proposalsContract);
      const loadProposals = async () => {
        const proposalList = await fetchProposals();
        setProposals(proposalList);
      };
      loadProposals();
    }
  }, [proposalsContract]);

  return {
    createProposal,
    fetchProposals,
    fetchProposalDetails,
    voteForProposal,
    voteAgainstProposal,
    proposals
  };
};
