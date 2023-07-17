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

contract DPollVoting is DPollMember {
   
    modifier onlyMember() {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        _;
    }

    //modifer to avoid illimited creation of proposal max 1 creation per 4 days

    modifier onlyOncePer4Days() {
        require(members[msg.sender].lastProposalCreation + creationDelay.value < block.timestamp, "You can only create one proposal every 4 days");
        _;
    }

    //ADD getPEndingsProposal() to get all the proposals not executed

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

        rewardAction();
       
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
        rewardAction();
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

    function rewardAction() public onlyMember {
        DPTtoken.transfer(msg.sender, 1);
    }

}