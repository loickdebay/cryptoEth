import React, { useState } from 'react';

const VotingSession = ({ votingInstance }) => {
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [status, setStatus] = useState('');
  const [voted, setVoted] = useState(false);

  const handleProposalSelection = (event) => {
    setSelectedProposalId(Number(event.target.value));
  };

  const handleVote = async () => {
    try {
      await votingInstance.methods.vote(selectedProposalId).send({ from: 'YOUR_VOTER_ADDRESS' });
      setStatus('Vote enregistré avec succès.');
      setVoted(true);
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      setStatus(`Erreur lors du vote: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Session de vote</h2>
      <div>
        <h3>Choisissez votre proposition préférée :</h3>
        <select onChange={handleProposalSelection}>
          <option value={null}>Sélectionnez une proposition</option>
          {/* Populate with available proposals */}
        </select>
        <button onClick={handleVote} disabled={voted || selectedProposalId === null}>
          Voter
        </button>
      </div>
      <div>Status: {status}</div>
    </div>
  );
};

export default VotingSession;