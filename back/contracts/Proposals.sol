// SPDX-License-Identifier: UNLICENSED 
pragma solidity ^0.8.28;

import "./Proposition.sol";

contract Proposals {
    // Liste de toutes les propositions
    Proposition[] public allPropositions;
    mapping(address => Proposition[]) public userPropositions;

    // Événements
    event PropositionCreated(address propositionAddress, address creator, string title);

    function createProposition(
        string memory _title, 
        string memory _description
    ) external returns (address) {
        Proposition newProposition = new Proposition(
            msg.sender, 
            _title, 
            _description
        );
        
        allPropositions.push(newProposition);
        userPropositions[msg.sender].push(newProposition);
        
        emit PropositionCreated(address(newProposition), msg.sender, _title);
        
        return address(newProposition);
    }

    function getAllPropositions() external view returns (address[] memory) {
    address[] memory propositionAddresses = new address[](allPropositions.length);
    for (uint i = 0; i < allPropositions.length; i++) {
        propositionAddresses[i] = address(allPropositions[i]);
    }
    return propositionAddresses;
}


    function getUserPropositions(address _user) external view returns (Proposition[] memory) {
        return userPropositions[_user];
    }
}