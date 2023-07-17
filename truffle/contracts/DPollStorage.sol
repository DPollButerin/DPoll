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
    enum MemberRole {GUEST, DAO, TEAM, OWNER, MEMBER}

    enum PollStatus {CREATED, OPEN, CLOSED, EXECUTED}
    enum ProposalType { PROPOSAL, UPDATE_EXECUTION, TRANSFERT_EXECUTION, REVOCATION_EXECUTION }

    enum SubmissionStatus {SUBMITTED, CLOSED, VALIDATED }

    struct Member {
        address memberAddress;
        uint256 memberSince;
        uint256 lastProposalCreation;
        uint256 balance;
        uint256 rewardsBlance;
        MemberRole role;
    }

    struct Value {
        uint256 value;
        uint256 min;
        uint256 max;
    }

    struct ProposalState {
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesTotal;
        PollStatus status;
        uint256 createdAt;
        uint256 closedAt;
        uint256 executedAt;
    }

    struct ProposalPayload {
        address[] payloadAddresses;
        uint256[] payloadUint256;
        string[] payloadString;
    }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        ProposalType purpose;
        ProposalState state;
        address creator;
        ProposalPayload payload;
        mapping(address => bool) voted;
    }

    struct PollSubmission {
        address pollAddress;
        uint256 submissionDate;
        uint256 voteCount;
        uint256 amountToDAO;
        uint256 amountToValidators;
        SubmissionStatus status;
        address[] validators;
    }
    
    //:::::::::::::::::::::::::::: MEMBERSHIP ::::::::::::::::::::::::
    DPollToken public DPTtoken;
    uint public DAObalance;
    uint256 public constant DAO_MEMBERSHIP_FEE = 0.1 ether;



    //:::::::::::::::::::::::::::: PROPOSALS VOTE ::::::::::::::::::::::::
    uint public minTokenToVote = 1;
    uint public minTokenToCreate = minTokenToVote * 2;

    uint proposalPctQuorum = 66;
    uint executionPctQuorum = 75;
    uint minPctThreshold = 50;

    uint public initialVotingDuration = 2 minutes;
    uint public initialExecutionDelay = 2 minutes;
    uint public constant initialCreationDelay = 2 minutes;
    Value public votingDuration = Value(initialVotingDuration, 30 seconds, 4 weeks);
    Value public executionDelay = Value(initialExecutionDelay, 30 seconds, 4 weeks);
    Value public creationDelay = Value(initialCreationDelay, 30 seconds, 4 weeks);

    uint256 public distributedTokenCount; //iutil now

    uint256 public proposalCount;

    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::

    uint256 public requiredValidators = 3;
    uint256 public requiredValidations = 2;
    uint256 public pollSubmissionDuration = 1 weeks;

    //:::::::::::::::::::::::::::: MEMBERSHIP ::::::::::::::::::::::::

    mapping(address => Member) public members;
    Member[] public membersList;


    //:::::::::::::::::::::::::::: PROPOSALS VOTE ::::::::::::::::::::::::
    string[] internal updatableVariables = ["VotingDuration", "ExecutionDelay"];

    mapping(uint256 => Proposal) public proposals; //max index is proposalCount
    uint256[] public pendingProposalsId;
    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::
    PollSubmission[] public pollSubmissions;

     

}