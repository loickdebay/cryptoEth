import React, { useState, useEffect } from 'react';

const Results = ({ votingInstance }) => {
  const [winner, setWinner] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const winnerId = await votingInstance.methods.getWinner().call();
        setWinner(winnerId);
        const proposalCount = await votingInstance.methods.getProposalCount().call();
        const proposalData = [];
        for (let i = 0; i < proposalCount; i++) {
          const proposal = await votingInstance.methods.getProposal(i).call();
          proposalData.push(proposal);
        }
        setProposals(proposalData);
        setStatus('Votes comptabilisés.');
      } catch (error) {
        console.error('Erreur lors du calcul des résultats:', error);
        setStatus(`Erreur lors du calcul des résultats: ${error.message}`);
      }
    };

    fetchData();
  }, [votingInstance]);

  return (
    <div>
      <h2>Résultats</h2>
      {winner !== null ? (
        <div>
          <h3>Proposition gagnante :</h3>
          {proposals[winner] && <p>{proposals[winner].description}</p>}
        </div>
      ) : (
        <p>Aucun gagnant pour le moment.</p>
      )}
      <div>Status: {status}</div>
    </div>
  );
};

export default Results;