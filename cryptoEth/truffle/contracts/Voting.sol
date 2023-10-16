// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    // Structures de données
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    // Variables
    WorkflowStatus public workflowStatus;
    uint public winningProposalId;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    // Événements
    event VoterRegistered(address indexed voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address indexed voter, uint proposalId);

    // Modificateur pour s'assurer que le workflow suit l'ordre approprié
    modifier inState(WorkflowStatus _status) {
        require(workflowStatus == _status, "Invalid workflow status");
        _;
    }

    // Constructeur
    constructor() Ownable(msg.sender) {
        workflowStatus = WorkflowStatus.RegisteringVoters;
    }

    // Fonction pour inscrire un électeur
    function registerVoter(address _voterAddress) external onlyOwner inState(WorkflowStatus.RegisteringVoters) {
        require(!voters[_voterAddress].isRegistered, "Voter already registered");
        voters[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }

    // Fonction pour démarrer la session d'enregistrement des propositions
    function startProposalsRegistration() external onlyOwner inState(WorkflowStatus.RegisteringVoters) {
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    // Fonction pour enregistrer une proposition
    function registerProposal(string memory _description) external inState(WorkflowStatus.ProposalsRegistrationStarted) {
        require(voters[msg.sender].isRegistered, "Sender is not a registered voter");
        proposals.push(Proposal({
            description: _description,
            voteCount: 0
        }));
        emit ProposalRegistered(proposals.length - 1);
    }

    // Fonction pour clôturer la session d'enregistrement des propositions
    function endProposalsRegistration() external onlyOwner inState(WorkflowStatus.ProposalsRegistrationStarted) {
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    // Fonction pour démarrer la session de vote
    function startVotingSession() external onlyOwner inState(WorkflowStatus.ProposalsRegistrationEnded) {
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    // Fonction pour voter sur une proposition
    function vote(uint _proposalId) external {
        require(voters[msg.sender].isRegistered, "Sender is not a registered voter");
        require(!voters[msg.sender].hasVoted, "Sender has already voted");
        require(_proposalId < proposals.length, "Invalid proposal ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    // Fonction pour clôturer la session de vote
    function endVotingSession() external onlyOwner inState(WorkflowStatus.VotingSessionStarted) {
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    // Fonction pour comptabiliser les votes et déterminer le gagnant
    function tallyVotes() external onlyOwner inState(WorkflowStatus.VotingSessionEnded) {
        uint maxVoteCount = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVoteCount) {
                maxVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    // Fonction pour obtenir le gagnant
    function getWinner() external view returns (uint) {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Votes have not been tallied yet");
        return winningProposalId;
    }

    // Fonction pour reset le contrat pour un nouveau vote
    function resetContract() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Cannot reset in the current workflow status");
        
        // Réinitialiser toutes les données du contrat
        for (uint i = 0; i < proposals.length; i++) {
            delete proposals[i];
        }
        
        // Copier chaque élément de la mémoire (proposals) dans le stockage (proposals)
        uint proposalsCount = proposals.length;
        for (uint j = 0; j < proposalsCount; j++) {
            Proposal storage proposal = proposals[j];
            proposal.description = '';
            proposal.voteCount = 0;
        }
        
        winningProposalId = 0;

        workflowStatus = WorkflowStatus.RegisteringVoters;
        emit WorkflowStatusChange(WorkflowStatus.VotesTallied, WorkflowStatus.RegisteringVoters);
    }
}