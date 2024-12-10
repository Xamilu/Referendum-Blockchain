import React, { useState, useEffect } from 'react';
import { List, Card, Typography } from 'antd';
import { useContracts } from '../hooks/useContracts';
import { Proposal } from '../types/type';


interface ProposalListProps {
  signer: any;
  onSelectProposal: (address: string) => void;
}

export const ProposalList: React.FC<ProposalListProps> = ({ signer, onSelectProposal }) => {
  const [proposals, setProposals] = useState<string[]>([]);
  const [proposalDetails, setProposalDetails] = useState<Proposal[]>([]);
  const { fetchProposals, fetchProposalDetails } = useContracts(signer);

  useEffect(() => {
    const loadProposals = async () => {
      const proposalAddresses = await fetchProposals();
      setProposals(proposalAddresses);

      const details = await Promise.all(
        proposalAddresses.map(address => fetchProposalDetails(address))
      );
      setProposalDetails(details.filter(detail => detail !== null) as Proposal[]);
    };

    if (signer) {
      loadProposals();
    }
  }, [signer]);

  return (
    <List
      grid={{ gutter: 16, column: 4 }}
      dataSource={proposalDetails}
      renderItem={(proposal) => (
        <List.Item>
          <Card 
            title={proposal.title}
            extra={<a onClick={() => onSelectProposal(proposal.creator)}>Détails</a>}
          >
            <Typography.Paragraph ellipsis={{ rows: 2 }}>
              {proposal.description}
            </Typography.Paragraph>
            <div>
              <p>Pour: {proposal.percentFor}%</p>
              <p>Contre: {proposal.percentAgainst}%</p>
              <p>Total votes: {proposal.totalVotes}</p>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};