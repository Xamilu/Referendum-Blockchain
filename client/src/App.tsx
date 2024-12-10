import  React,{ useState } from 'react';
import { Layout, Typography } from 'antd';
import { useWeb3 } from './hooks/useWeb3';
import { ConnectWallet } from './components/ConnectWallet';
import { CreateProposal } from './components/CreateProposal';
import { useContracts } from './hooks/useContracts';
import { ProposalDetails } from './components/ProposalDetails';
import { ProposalList } from './components/ProposalList';
import { Proposal } from './types/type';

const { Header, Content }  = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const web3Context = useWeb3();
  const [selectedProposal, setSelectedProposal] = useState<{address: string, proposal: Proposal} | null>(null);

  const handleSelectProposal = async (proposalAddress: string) => {
    if (web3Context.signer) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { fetchProposalDetails } = useContracts(web3Context.signer);
      const proposalDetails = await fetchProposalDetails(proposalAddress);
      
      if (proposalDetails) {
        setSelectedProposal({ 
          address: proposalAddress, 
          proposal: proposalDetails 
        });
      }
    }
  };

  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title style={{ color: 'white', margin: 0 }}>Plateforme de Vote Blockchain</Title>
        <ConnectWallet web3Context={web3Context} />
      </Header>
      <Content style={{ padding: '50px' }}>
        {web3Context.account ? (
          <>
            <CreateProposal signer={web3Context.signer} />
            <ProposalList 
              signer={web3Context.signer} 
              onSelectProposal={handleSelectProposal} 
            />
            {selectedProposal && (
              <ProposalDetails
                proposal={selectedProposal.proposal}
                proposalAddress={selectedProposal.address}
                signer={web3Context.signer}
                onClose={() => setSelectedProposal(null)}
              />
            )}
          </>
        ) : (
          <Typography.Text>Veuillez connecter votre portefeuille</Typography.Text>
        )}
      </Content>
    </Layout>
  );
};

export default App;

