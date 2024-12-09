// src/types.ts
export interface Proposal {
    creator: string;
    title: string;
    description: string;
    startTime: number;
    votingDuration: number;
    votesFor: number;
    votesAgainst: number;
    isActive: boolean;
    totalVotes: number;
    percentFor: number;
    percentAgainst: number;
  }
  
  export interface Web3ContextType {
    account: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signer: any;
    
  }