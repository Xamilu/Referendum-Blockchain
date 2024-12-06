// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;

contract Proposition {
    // Structure des détails de la proposition
    struct PropositionDetails {
        address creator;
        string title;
        string description;
        uint256 startTime;
        uint256 votingDuration;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        bool isActive;
    }

    PropositionDetails public propositionDetails;
    
    // Événements pour tracer les actions
    event VoteCast(address voter, bool vote);
    event PropositionClosed(uint256 votesFor, uint256 votesAgainst);

    constructor(
        address _creator, 
        string memory _title, 
        string memory _description
    ) {
        propositionDetails.creator = _creator;
        propositionDetails.title = _title;
        propositionDetails.description = _description;
        propositionDetails.startTime = block.timestamp;
        propositionDetails.votingDuration = 1 minutes;
        propositionDetails.isActive = true;
    }

    modifier votingStillOpen() {
        require(
            block.timestamp < propositionDetails.startTime + propositionDetails.votingDuration, 
            "Voting period has ended"
        );
        require(propositionDetails.isActive, "Proposition is not active");
        _;
    }

    modifier hasNotVoted() {
        require(
            !propositionDetails.hasVoted[msg.sender], 
            "You have already voted"
        );
        _;
    }

    // Fonction pour voter pour une proposition
    function voteFor() external votingStillOpen hasNotVoted {
        propositionDetails.votesFor++;
        propositionDetails.hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, true);
    }

    // Fonction pour voter contre une proposition
    function voteAgainst() external votingStillOpen hasNotVoted {
        propositionDetails.votesAgainst++;
        propositionDetails.hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, false);
    }

    // Fonction pour obtenir les détails de la proposition
    function getPropositionDetails() external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 votingDuration,
        uint256 votesFor,
        uint256 votesAgainst,
        bool isActive,
        uint256 totalVotes,
        uint256 percentFor,
        uint256 percentAgainst
    ) {
        uint256 totalVotesCount = propositionDetails.votesFor + propositionDetails.votesAgainst;
        uint256 percentageFor = totalVotesCount > 0 
            ? (propositionDetails.votesFor * 100) / totalVotesCount 
            : 0;
        uint256 percentageAgainst = totalVotesCount > 0 
            ? (propositionDetails.votesAgainst * 100) / totalVotesCount 
            : 0;

        return (
            propositionDetails.creator,
            propositionDetails.title,
            propositionDetails.description,
            propositionDetails.startTime,
            propositionDetails.votingDuration,
            propositionDetails.votesFor,
            propositionDetails.votesAgainst,
            propositionDetails.isActive,
            totalVotesCount,
            percentageFor,
            percentageAgainst
        );
    }

    // Fonction pour clôturer la proposition si le temps est écoulé
    function closeProposition() external {
        require(
            block.timestamp >= propositionDetails.startTime + propositionDetails.votingDuration, 
            "Voting period has not ended"
        );
        require(propositionDetails.isActive, "Proposition already closed");
        
        propositionDetails.isActive = false;
        emit PropositionClosed(propositionDetails.votesFor, propositionDetails.votesAgainst);
    }
}
