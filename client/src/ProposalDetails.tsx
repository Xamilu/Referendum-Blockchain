import React from 'react';
import { Modal, Progress, Button, message } from 'antd';
import { useContracts } from './hooks/useContracts';
import { Proposal } from './type';


interface ProposalDetailsProps {
  proposal: Proposal;
  proposalAddress: string;
  signer: any;
  onClose: () => void;
}

export const ProposalDetails: React.FC<ProposalDetailsProps> = ({ 
  proposal, 
  proposalAddress,
  signer, 
  onClose 
}) => {
  const { voteForProposal, voteAgainstProposal } = useContracts(signer);

  const handleVote = async (vote: 'for' | 'against') => {
    const result = vote === 'for' 
      ? await voteForProposal(proposalAddress)
      : await voteAgainstProposal(proposalAddress);

    if (result) {
      message.success('Vote enregistré avec succès');
      onClose();
    } else {
      message.error('Erreur lors du vote');
    }
  };

  return (
    <Modal 
      title={proposal.title}
      visible={true}
      onCancel={onClose}
      footer={[
        <Button key="for" type="primary" onClick={() => handleVote('for')}>
          Voter Pour
        </Button>,
        <Button key="against" type="primary" color='danger' onClick={() => handleVote('against')}>
          Voter Contre
        </Button>
      ]}
    >
      <p>{proposal.description}</p>
      <div>
        <Progress 
          percent={proposal.percentFor} 
          status="active" 
          strokeColor="#52c41a"
        />
        <p>Pour: {proposal.percentFor}%</p>
        <Progress 
          percent={proposal.percentAgainst} 
          status="active" 
          strokeColor="#f5222d"
        />
        <p>Contre: {proposal.percentAgainst}%</p>
        <p>Votes totaux: {proposal.totalVotes}</p>
      </div>
    </Modal>
  );
};
