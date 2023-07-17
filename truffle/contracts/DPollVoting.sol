// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

//comment minimalist... se passe de discord discussion, first vote offchain with tasnapshot, end communcation on tally
//consider proposal passed this steps

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";
import "./DPollMember.sol";

contract DPollVoting is DPollMember {
    //eth balance of the DAO
    uint public initialVotingDuration = 2 minutes;
    uint public initialExecutionDelay = 2 minutes;
    uint public constant initialCreationDelay = 2 minutes;

    //token min to create : 2 * min to vote (1 DPT)
    //token min par type : min vote DPT PROPOSAL / 2 min vote UPDATE / 2 D* min votePT TRANSFERT / 2 D* min votePT REVOCATION
    uint public minTokenToVote = 1;
    uint public minTokenToCreate = minTokenToVote * 2;
    // uint public minTokenToVoteProposal = minTokenToVote;
    // uint public minTokenToVoteUpdate = minTokenToVote * 2;
    // uint public minTokenToVoteTransfert = minTokenToVote * 2;
    // uint public minTokenToVoteRevocation = minTokenToVote * 2;

    //NO PONDERATION AT THE MOMENT : if later : need mechanism snapshot => track balance at crtain time when creat vote
    //ex : when distributing supply => track the amount with last & previous op

    //arrondi au int superieur // valeur a redefinir
    uint proposalPctQuorum = 66;
    uint executionPctQuorum = 75;
    uint minPctThreshold = 50;

    struct Value {
        uint256 value;
        uint256 min;
        uint256 max;
    }

    Value public votingDuration = Value(initialVotingDuration, 30 seconds, 4 weeks);
    Value public executionDelay = Value(initialExecutionDelay, 30 seconds, 4 weeks);
    Value public creationDelay = Value(initialCreationDelay, 30 seconds, 4 weeks);

    enum PollStatus {CREATED, OPEN, CLOSED, EXECUTED}
    enum ProposalType { PROPOSAL, UPDATE_EXECUTION, TRANSFERT_EXECUTION, REVOCATION_EXECUTION }
    
    string[] internal updatableVariables = ["VotingDuration", "ExecutionDelay"];

    uint256 public distributedTokenCount; //iutil now

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

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
     

    modifier onlyMember() {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        _;
    }

    //modifer to avoid illimited creation of proposal max 1 creation per 4 days

    modifier onlyOncePer4Days() {
        require(members[msg.sender].lastProposalCreation + creationDelay.value < block.timestamp, "You can only create one proposal every 4 days");
        _;
    }


    //DAO has all the initial supply
    //vote give 1 DPTtoken to voter //create give 1 DPTtoken to creator
    //process to avoid creation to gain illimited DPTtoken
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



        //give 1 DPTtoken to creator
        DPTtoken.transfer(msg.sender, 1);
       
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
        //give 1 DPTtoken to voter
        DPTtoken.transfer(msg.sender, 1);
    }

    function closeVote(uint256 _proposalId) public onlyMember {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state.status == PollStatus.OPEN, "Poll is not open");
        require(proposal.state.closedAt == 0, "Poll is already closed");
        require(proposal.state.createdAt + votingDuration.value < block.timestamp, "Voting period is not over");
        proposal.state.status = PollStatus.CLOSED;
        proposal.state.closedAt = block.timestamp;

        DPTtoken.transfer(msg.sender, 1);
    }

    function executeVote(uint256 _proposalId) public onlyMember {
        require(proposals[_proposalId].state.status == PollStatus.CLOSED, "Poll is not closed");
        require(proposals[_proposalId].state.executedAt != 0, "Poll is already executed");
        require(proposals[_proposalId].state.closedAt + executionDelay.value < block.timestamp, "Execution delay is not over");
        require(proposals[_proposalId].purpose != ProposalType.PROPOSAL, "Proposal is not an execution");
        proposals[_proposalId].state.status = PollStatus.EXECUTED;
        proposals[_proposalId].state.executedAt = block.timestamp;
        if (proposals[_proposalId].purpose == ProposalType.UPDATE_EXECUTION) {
            executeUpdate(_proposalId);
        } else if (proposals[_proposalId].purpose == ProposalType.TRANSFERT_EXECUTION) {
            executeTransfert(_proposalId);
        } else if (proposals[_proposalId].purpose == ProposalType.REVOCATION_EXECUTION) {
            executeRevocation(_proposalId);
        }

        DPTtoken.transfer(msg.sender, 1);
    }


//when eternal storage => compsotion name easier to get the variable in mapping
    //add check des range de vairbale possible
    function executeUpdate(uint256 _proposalId) internal onlyMember {
        ProposalPayload memory payload = proposals[_proposalId].payload;
        Value memory currentVotingDuration = votingDuration;
        Value memory currentExecutionDelay = executionDelay;
        Value memory currentCreationDelay = creationDelay;
        require(payload.payloadString.length == payload.payloadUint256.length, "Payload length mismatch");
        require(payload.payloadString.length != 0, "Payload is empty");
        require(checkUpdatableVariables(payload.payloadString), "Payload contains non updatable variables");

        for (uint256 i = 0; i < payload.payloadString.length; i++) {
            bytes32 variable = keccak256(abi.encodePacked(payload.payloadString[i]));
            if (variable == keccak256(abi.encodePacked("VotingDuration"))) {
                require(payload.payloadUint256[i] >= currentVotingDuration.min && payload.payloadUint256[i] <= currentVotingDuration.max, "Voting duration out of range");
                votingDuration.value = payload.payloadUint256[i];
            } else if (variable == keccak256(abi.encodePacked("ExecutionDelay"))) {
                require(payload.payloadUint256[i] >= currentExecutionDelay.min && payload.payloadUint256[i] <= currentExecutionDelay.max, "Execution delay out of range");
                executionDelay.value = payload.payloadUint256[i];
            } else if (variable == keccak256(abi.encodePacked("CreationDelay"))) {
                require(payload.payloadUint256[i] >= currentCreationDelay.min && payload.payloadUint256[i] <= currentCreationDelay.max, "Creation delay out of range");
                creationDelay.value = payload.payloadUint256[i];
            }
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

    function executeTransfert(uint256 _proposalId) internal onlyMember {
        ProposalPayload memory payload = proposals[_proposalId].payload;
        require(payload.payloadAddresses.length == payload.payloadUint256.length, "Payload length mismatch");
        require(payload.payloadAddresses.length != 0, "Payload is empty");
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < payload.payloadAddresses.length; i++) {
            DPTtoken.transfer(payload.payloadAddresses[i], payload.payloadUint256[i]);  
        }
    }

    function executeRevocation(uint256 _proposalId) internal onlyMember {
        ProposalPayload memory payload = proposals[_proposalId].payload;
        require(payload.payloadAddresses.length != 0, "Payload is empty");
        for (uint256 i = 0; i < payload.payloadAddresses.length; i++) {
           revokeMembership(payload.payloadAddresses[i]);
        }

    }

}