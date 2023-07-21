// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
At the moment about proposals :
-these actions are avaible only for active members
-proposals have a type (proposal, update, transfert, revocation). the first one is 'formal' and
the 3 others are 'execution' to update setting (see DPollStorage), transfert DPTtoken or revoke membership
-proposals have a state (created, open, closed, executed)
-to create a proposal, you need to be a member and have at least 2 DPTtoken
-to vote, you need to be a member and have at least 1 DPTtoken
-to close a vote, you need to be a member and have at least 1 DPTtoken
-to execute a proposal, you need to be a member and have at least 1 DPTtoken
-There's a delay to vote since the creation of the proposal and to execute the proposal since the end of the vote
-All these actions give 1 DPTtoken to the member who perform them
*/

/**
@title DPollVoting
@author  ibourn
@notice This contract is used to manage the proposals and the voting
 */
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";
import "./DPollMember.sol";
import "./DPollDAO.sol";    
import "./DPollToken.sol";

contract DPollPluginProposals {
        enum MemberRole {GUEST, DAO, TEAM, OWNER, MEMBER}


    struct Member {
        address memberAddress;
        uint256 memberSince;
        uint256 lastProposalCreation;
        uint256 balance;
        uint256 rewardsBlance;
        MemberRole role;
    }

    DPollDAO public dpollDAO;
    address payable public DAOAddress;

    DPollToken public DPTtoken;
    address public DPTtokenAddress;
   
    modifier onlyMember() {
        require(dpollDAO.isMember(msg.sender), "You are not a member");
        _;
    }


    //modifer to avoid illimited creation of proposal max 1 creation per 4 days

    modifier onlyOncePer4Days() {
        require(dpollDAO.getMember(msg.sender).lastProposalCreation + creationDelay.value < block.timestamp, "You can only create one proposal every 4 days");
        _;
    }


    

    constructor(address _DAOaddress, address _DPTtokenAddress) {
        DAOAddress = payable(_DAOaddress);
        dpollDAO = DPollDAO(DAOAddress);
        DPTtokenAddress = _DPTtokenAddress;
        DPTtoken = DPollToken(DPTtokenAddress);
    }
    //ADD getPEndingsProposal() to get all the proposals not executed

    //DAO has all the initial supply
    //vote give 1 DPTtoken to voter //create give 1 DPTtoken to creator
    //process to avoid creation to gain illimited DPTtoken
    enum PollStatus {CREATED, OPEN, CLOSED, EXECUTED}
    enum ProposalType { PROPOSAL, UPDATE_EXECUTION, TRANSFERT_EXECUTION, REVOCATION_EXECUTION }

        struct ProposalState {
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesTotal;
        PollStatus status;
        uint256 createdAt;
        uint256 closedAt;
        uint256 executedAt;
        bool accepted;
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

    struct Value {
        uint256 value;
        uint256 min;
        uint256 max;
    }

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

    string[] internal updatableVariables = ["VotingDuration", "ExecutionDelay"];

    mapping(uint256 => Proposal) public proposals; //max index is proposalCount
    uint256[] public pendingProposalsId;
    




    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _purpose,
        address[] memory _payloadAddresses,
        uint256[] memory _payloadUint256,
        string[] memory _payloadString
    ) public onlyMember onlyOncePer4Days {
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.title = _title;
        proposal.description = _description;
        proposal.purpose = _purpose;
        proposal.state.status = PollStatus.CREATED;
        proposal.state.createdAt = block.timestamp;
        proposal.creator = msg.sender;
        proposal.payload.payloadAddresses = _payloadAddresses;
        proposal.payload.payloadUint256 = _payloadUint256;
        proposal.payload.payloadString = _payloadString;

        rewardAction(msg.sender);
                dpollDAO.rewardVoter(msg.sender);

       
    }



    //ponderer le vote par le nombre de token (plus tard sera autrement rootsquare..)
    //verifier que le voter a bien le nombre de token necessaire
    function vote(uint256 _proposalId, bool _vote) public onlyMember {
        // ProposalType proposalType = proposals[_proposalId].purpose;
        require(DPTtoken.balanceOf(msg.sender) >= minTokenToVote, "You need to have at least 1 DPTtoken to vote");
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state.status == PollStatus.OPEN, "Poll is not open");
        require(proposal.voted[msg.sender] == false, "You already voted");
        proposal.voted[msg.sender] = true;
        proposal.state.votesTotal++;
        if (_vote) {
            proposal.state.votesFor++;
        } else {
            proposal.state.votesAgainst++;
        }
        rewardAction(msg.sender);
                dpollDAO.rewardVoter(msg.sender);

    }

    function closeVote(uint256 _proposalId) public onlyMember {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state.status == PollStatus.OPEN, "Poll is not open");
        require(proposal.state.closedAt != 0, "Poll is already closed");
        require(proposal.state.createdAt + votingDuration.value < block.timestamp, "Voting period is not over");
        proposal.state.status = PollStatus.CLOSED;
        proposal.state.closedAt = block.timestamp;

        //check if proposal is validated or rejected
        //1. is there enough vote ? (> proposalPctQuorum : > 66% de membersList)
        //2. is there enough vote for ? (> minPctThreshold : for > against)

         
        uint256 totalVotes = proposal.state.votesTotal;
        uint256 votesFor = proposal.state.votesFor;
        uint256 votesAgainst = proposal.state.votesAgainst;
        uint256 votesForPct = votesFor * 100 / totalVotes;
        uint256 votesAgainstPct = votesAgainst * 100 / totalVotes;

        proposal.state.status = PollStatus.CLOSED;
        if (totalVotes * 100 / dpollDAO.getMembersCount() >= proposalPctQuorum) {
            if (votesForPct > minPctThreshold) {
                proposal.state.status = PollStatus.CLOSED;
                proposal.state.executedAt = block.timestamp;
                proposal.state.accepted = true;
            } 
        }

         



        rewardAction(msg.sender);
                dpollDAO.rewardVoter(msg.sender);

    }

    function executeVote(uint256 _proposalId) public onlyMember {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state.status == PollStatus.CLOSED, "Poll is not closed");
        require(proposal.state.accepted == true, "Poll is not accepted");
        require(proposal.state.executedAt != 0, "Poll is already executed");
        require(proposal.state.closedAt + executionDelay.value < block.timestamp, "Execution delay is not over");
        require(proposal.purpose != ProposalType.PROPOSAL, "Proposal is not an execution");
        proposal.state.status = PollStatus.EXECUTED;
        proposal.state.executedAt = block.timestamp;
        if (proposal.purpose == ProposalType.UPDATE_EXECUTION) {
            executeUpdate(_proposalId);
        }// else if (proposal.purpose == ProposalType.TRANSFERT_EXECUTION) {
        //     executeTransfert(_proposalId);
        // } else if (proposal.purpose == ProposalType.REVOCATION_EXECUTION) {
        //     executeRevocation(_proposalId);
        // }

        rewardAction(msg.sender);
        dpollDAO.rewardVoter(msg.sender);
    }


//when eternal storage => compsotion name easier to get the variable in mapping
    //add check des range de vairbale possible
    function executeUpdate(uint256 _proposalId) internal onlyMember {
        ProposalPayload memory payload = proposals[_proposalId].payload;
        Value memory currentVotingDuration = votingDuration;
        Value memory currentExecutionDelay = executionDelay;
        Value memory currentCreationDelay = creationDelay;
        uint payloadStringLength = payload.payloadString.length;
        require(payloadStringLength == payload.payloadUint256.length, "Payload length mismatch");
        require(payloadStringLength != 0, "Payload is empty");
        require(checkUpdatableVariables(payload.payloadString), "Payload contains non updatable variables");

        for (uint256 i = 0; i < payloadStringLength; i++) {
            bytes32 variable = keccak256(abi.encodePacked(payload.payloadString[i]));
            uint value = payload.payloadUint256[i];
            if (variable == keccak256(abi.encodePacked("VotingDuration"))) {
                require(value >= currentVotingDuration.min && value <= currentVotingDuration.max, "Voting duration out of range");
                votingDuration.value = value;
            } //else if (variable == keccak256(abi.encodePacked("ExecutionDelay"))) {
            //     require(value >= currentExecutionDelay.min && value <= currentExecutionDelay.max, "Execution delay out of range");
            //     executionDelay.value = value;
            // } else if (variable == keccak256(abi.encodePacked("CreationDelay"))) {
            //     require(value >= currentCreationDelay.min && value <= currentCreationDelay.max, "Creation delay out of range");
            //     creationDelay.value = value;
            // }
        }



    

    }

    function checkUpdatableVariables(string[] memory _updatableVariables) internal view returns (bool) {
        for (uint256 i = 0; i < _updatableVariables.length; i++) {
            bool isUpdatable = false;
            for (uint256 j = 0; j < updatableVariables.length; j++) {
                if (keccak256(abi.encodePacked(_updatableVariables[i])) == keccak256(abi.encodePacked(updatableVariables[j]))) {
                    isUpdatable = true;
                }
            }
            if (!isUpdatable) {
                return false;
            }
        }
        return true;
    }

    // function executeTransfert(uint256 _proposalId) internal onlyMember {
    //     ProposalPayload memory payload = proposals[_proposalId].payload;
    //     require(payload.payloadAddresses.length == payload.payloadUint256.length, "Payload length mismatch");
    //     require(payload.payloadAddresses.length != 0, "Payload is empty");
    //     uint256 totalAmount = 0;
    //     for (uint256 i = 0; i < payload.payloadAddresses.length; i++) {
    //         DPTtoken.transfer(payload.payloadAddresses[i], payload.payloadUint256[i]);  
    //     }
    // }

    // function executeRevocation(uint256 _proposalId) internal onlyMember {
    //     ProposalPayload memory payload = proposals[_proposalId].payload;
    //     require(payload.payloadAddresses.length != 0, "Payload is empty");
    //     for (uint256 i = 0; i < payload.payloadAddresses.length; i++) {
    //        revokeMembership(payload.payloadAddresses[i]);
    //     }

    // }

    event DAOTokenTransfer(address to, uint amount, string action);
    function rewardAction(address _to) internal {
        require(_to != address(0), "Invalid address");
        require(dpollDAO.isMember(_to), "Not member");
        DPTtoken.transfer(_to, 1);

//ici call DAOsteRewrdVoters
        emit DAOTokenTransfer(_to, 1, "Reward");
    }

}