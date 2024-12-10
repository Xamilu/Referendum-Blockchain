import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProposalsABI from "../abi/ProposalsABI.json"
import PropositionABI from "../abi/PropositionABI.json"
import { Proposal } from '../types/type';

const PROPOSALS_CONTRACT_ADDRESS = '0xe28FBBaDdA81280CCb05B39875081bbcd2C9732f';

export const useContracts = (signer: any) => {
  const [proposalsContract, setProposalsContract] = useState<any>(null);

useEffect(() => {
    if (signer) {
        const contract = new ethers.Contract(PROPOSALS_CONTRACT_ADDRESS, ProposalsABI, signer);
        setProposalsContract(contract);
    }
}, [signer]);

const createProposal = async (title: string, description: string) => {
    if (!proposalsContract) {
      console.error("Contrat non initialisé");
      return null;
    }
    
    try {
      const network = await signer.provider.getNetwork();
      const AMOY_CHAIN_ID = 80002;
  
      if (network.chainId !== AMOY_CHAIN_ID) {
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
  const fetchProposals = async (): Promise<string[]> => {
    if (!proposalsContract) return [];
    try {
      const proposals = await proposalsContract.getAllPropositions();
      return proposals;
    } catch (error) {
      console.error("Erreur lors de la récupération des propositions", error);
      return [];
    }
  };

  const fetchProposalDetails = async (proposalAddress: string): Promise<Proposal | null> => {
    if (!signer) return null;
    try {
    const propositionContract = new ethers.Contract(proposalAddress, PropositionABI, signer);
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

  const voteForProposal = async (proposalAddress: string) => {
    if (!signer) return null;
    try {
      const propositionContract = new ethers.Contract(proposalAddress, PropositionABI, signer);
      const tx = await propositionContract.voteFor();
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Erreur lors du vote", error);
      return null;
    }
  };

  const voteAgainstProposal = async (proposalAddress: string) => {
    if (!signer) return null;
    try {
      const propositionContract = new ethers.Contract(proposalAddress, PropositionABI, signer);
      const tx = await propositionContract.voteAgainst();
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Erreur lors du vote", error);
      return null;
    }
  };

  return {
    createProposal,
    fetchProposals,
    fetchProposalDetails,
    voteForProposal,
    voteAgainstProposal
  };
};