// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BlockCast {
    struct Candidate {
        uint256 id;
        string name;
        string role;
        uint256 voteCount;
    }

    Candidate[] private candidates;
    mapping(address => bool) public hasVoted;

    event VoteCast(address indexed voter, uint256 indexed candidateId);

    constructor(string[] memory names, string[] memory roles) {
        require(names.length > 0 && names.length == roles.length, 'Invalid candidate list');
        for (uint256 i = 0; i < names.length; i++) {
            candidates.push(Candidate(i, names[i], roles[i], 0));
        }
    }

    function vote(uint256 candidateId) external {
        require(!hasVoted[msg.sender], 'Wallet has already voted');
        require(candidateId < candidates.length, 'Candidate does not exist');
        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;
        emit VoteCast(msg.sender, candidateId);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }
}