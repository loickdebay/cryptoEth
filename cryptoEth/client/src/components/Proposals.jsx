import React, { useState } from 'react';

const Proposals = ({ votingInstance }) => {
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposals, setProposals] = useState([]);
  const [status, setStatus] = useState('');

  const handleProposalDescriptionChange = (event) => {
    setProposalDescription(event.target.value);
  };

  const handleRegisterProposal = async () => {
    try {
      await votingInstance.methods.registerProposal(proposalDescription).send({ from: 'YOUR_VOTER_ADDRESS' });
      const proposalId = proposals.length; // Assuming proposal IDs start from 0
      setProposals([...proposals, { id: proposalId, description: proposalDescription }]);
      setStatus(`Proposal "${proposalDescription}" registered successfully.`);
    } catch (error) {
      console.error('Error registering proposal:', error);
      setStatus(`Error registering proposal: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Enregistrement des propositions</h2>
      <input
        type="text"
        placeholder="Description de la proposition"
        value={proposalDescription}
        onChange={handleProposalDescriptionChange}
      />
      <button onClick={handleRegisterProposal}>Enregistrer la proposition</button>
      <div>Status: {status}</div>
      <div>
        <h3>Propositions enregistrées :</h3>
        <ul>
          {proposals.map((proposal) => (
            <li key={proposal.id}>{proposal.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Proposals;