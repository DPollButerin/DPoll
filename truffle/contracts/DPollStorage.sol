// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
This version of the DAO is only a POC, final functionnalities are not all implemented

Later versions will include:
-eternal storage to allow mor flexibility and upgradability
-a master contract and a slave containing the logics
-inherited contracts 'member...' will be used as plugins (facets like)

At the moment :
-the process to vote for proprosals concerning setting updates is limited to 3 variables:
votingDuration, executionDelay and creationDelay
-vote are not ponderated by voting power. Need later to implement a snapshot mechanism to allow voting power usage
-a blacklist is not implemented yet to prevent malicious or suspicious behaviour from revoked members

@todo : many optimization and refactoring
 */

/**
@title DPollStorage
@author ibourn
@notice This contract is used to store the DAO data
 */
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollToken.sol";

contract DPollStorage is Ownable {
    // enum MemberRole {GUEST, DAO, TEAM, OWNER, MEMBER}
    enum MemberRole {GUEST, MEMBER}

//change to ProposalStatus
    // enum PollStatus {CREATED, OPEN, CLOSED, EXECUTED}
    // enum ProposalType { PROPOSAL, UPDATE_EXECUTION, TRANSFERT_EXECUTION, REVOCATION_EXECUTION }

    //balance is the entry fees claimable later
    //rewardsBalance is all eth rewerd (at the moment only validator)
    //DPT token are transfert directly to member 
    struct Member {
        address memberAddress;
        uint256 memberSince;
        uint256 lastProposalCreation;
        uint256 balance;
        uint256 rewardsBalance;
        MemberRole role;
    }

    address public DAOPollValidatorAddress;
    address public DAOProposalsAddress;
    //:::::::::::::::::::::::::::: MEMBERSHIP ::::::::::::::::::::::::
    DPollToken public DPTtoken;
    uint public DAObalance;
    uint256 public constant DAO_MEMBERSHIP_FEE = 0.02 ether;



    // //:::::::::::::::::::::::::::: MEMBERSHIP ::::::::::::::::::::::::

    mapping(address => Member) public members;
    Member[] public membersList;


}