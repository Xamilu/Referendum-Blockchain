import React, { useState, useEffect } from 'react';
import { List, Card, Typography, Spin, Alert } from 'antd';
import { useContracts } from './hooks/useContracts';
import { Proposal } from './type';

interface ProposalListProps {
  signer: any;
  onSelectProposal: (address: string) => void;
}

export const ProposalList: React.FC<ProposalListProps> = ({ signer, onSelectProposal }) => {
  const [proposals, setProposals] = useState<string[]>([]);
  const [proposalDetails, setProposalDetails] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchProposals, fetchProposalDetails } = useContracts(signer);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setLoading(true);
        const proposalAddresses = await fetchProposals();
        setProposals(proposalAddresses);

        if (proposalAddresses.length === 0) {
          setError("Aucune proposition trouvée");
          return;
        }

        const details = await Promise.all(
          proposalAddresses.map(address => fetchProposalDetails(address))
        );
        
        const validDetails = details.filter(detail => detail !== null) as Proposal[];
        setProposalDetails(validDetails);
      } catch (err) {
        console.error("Erreur de chargement des propositions:", err);
        setError("Impossible de charger les propositions");
      } finally {
        setLoading(false);
      }
    };

    if (signer) {
      loadProposals();
    }
  }, [signer, fetchProposals, fetchProposalDetails]);

  if (loading) {
    return <Spin size="large" tip="Chargement des propositions..." />;
  }

  if (error) {
    return <Alert message={error} type="warning" />;
  }

  if (proposalDetails.length === 0) {
    return <Typography.Text>Aucune proposition disponible</Typography.Text>;
  }

  return (
    <>
      <Typography.Text>Nombre de propositions : {proposals.length}</Typography.Text>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={proposalDetails}
        renderItem={(proposal, index) => (
          <List.Item>
            <Card 
              title={proposal.title}
              extra={<a onClick={() => onSelectProposal(proposals[index])}>Détails</a>}
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
    </>
  );
};