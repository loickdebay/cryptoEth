import React, { useState } from 'react';

const RegisterVoters = ({ votingInstance }) => {
  const [voterAddress, setVoterAddress] = useState('');
  const [registeredVoters, setRegisteredVoters] = useState([]);
  const [status, setStatus] = useState('');

  const handleVoterAddressChange = (event) => {
    setVoterAddress(event.target.value);
  };

  const handleRegisterVoter = async () => {
    try {
      await votingInstance.methods.registerVoters([voterAddress]).send({ from: 'YOUR_ADMIN_ADDRESS' });
      setRegisteredVoters([...registeredVoters, voterAddress]);
      setStatus(`Voter ${voterAddress} registered successfully.`);
    } catch (error) {
      console.error('Error registering voter:', error);
      setStatus(`Error registering voter: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Enregistrement des électeurs</h2>
      <input
        type="text"
        placeholder="Adresse de l'électeur"
        value={voterAddress}
        onChange={handleVoterAddressChange}
      />
      <button onClick={handleRegisterVoter}>Enregistrer l'électeur</button>
      <div>Status: {status}</div>
      <div>
        <h3>Électeurs enregistrés :</h3>
        <ul>
          {registeredVoters.map((voter, index) => (
            <li key={index}>{voter}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RegisterVoters;