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
      renderItem={(proposals) => (
        <List.Item>
          <Card 
            title={proposals.title}
            extra={<a onClick={() => onSelectProposal(proposals.creator)}>Détails</a>}
          >
            <Typography.Paragraph ellipsis={{ rows: 2 }}>
              {proposals.description}
            </Typography.Paragraph>
            <div>
              <p>Pour: {proposals.percentFor}%</p>
              <p>Contre: {proposals.percentAgainst}%</p>
              <p>Total votes: {proposals.totalVotes}</p>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};