// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
 * At the moment about proposals :
 * -these actions are avaible only for active members
 * -proposals have a type (proposal, update, transfert, revocation). the first one is 'formal' and
 * the 3 others are 'execution' to update setting (see DPollStorage), transfert DPTtoken or revoke membership
 * -proposals have a state (created, open, closed, executed)
 * -to create a proposal, you need to be a member and have at least 2 DPTtoken
 * -to open a proposal, you need to be a member and have at least 1 DPTtoken
 * -to vote, you need to be a member and have at least 1 DPTtoken
 * -to close a vote, you need to be a member and have at least 1 DPTtoken
 * -to execute a proposal, you need to be a member and have at least 1 DPTtoken
 * -There's a delay to vote since the creation of the proposal and to execute the proposal since the end of the vote
 * -All these actions give 1 DPTtoken to the member who perform them
 *
 * FOR THIS EXAM : 
 * -only voting delay is fully implemented and made configurable by proposal
 * -for security reasons and to let bot run the flow more constraints need to be added later  
 *
 * -only voting dealy is updatable to implement the process of DAO proposal for executions
 * (in later version, more varibables will be updatable and other execution type will be implemented as transfert from de DAO or member revocation in case of malicious behaviour)
 *
 * -DPT token is here only used as voting power to access proposal actions (later a snapshot mechanism will be implemented to allow ponderation of votes...)
*/

/**
@title DPollPluginProposals
@author  ibourn
@notice This contract is a DAO plugin to manage proposals. It's a POC and not fully functionnal
@dev it's spliited from the main contract to allow upgradability later and to reduce the size of the main contract
 */
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";
import "./DPollMember.sol";
import "./DPollDAO.sol";    
import "./DPollToken.sol";

contract DPollPluginProposals {
    event ProposalChange(address indexed creator, uint256 indexed proposalId, ProposalStatus status);
    event ProposalExecution(uint256 indexed proposalId, ProposalType indexed proposalType);

    /**
    @notice This enum is used to define the status of a proposal
     */
    enum ProposalStatus {CREATED, OPEN, CLOSED, EXECUTED}
    /**
    @notice This enum is used to define the action type of a proposal
     */
    enum ProposalType { PROPOSAL, UPDATE_EXECUTION, TRANSFERT_EXECUTION, REVOCATION_EXECUTION }

    struct ProposalState {
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesTotal;
        ProposalStatus status;
        uint256 createdAt;
        uint256 closedAt;
        uint256 executedAt;
        bool isAccepted;
    }

    //@todo: use bytes32 to store the payload
    struct ProposalPayload {
        // address[] payloadAddresses;
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
    // uint executionPctQuorum = 75;
    uint minPctThreshold = 50;

    uint public initialVotingDuration = 2 minutes;
    // uint public initialExecutionDelay = 2 minutes;
    uint public constant initialCreationDelay = 2 minutes;

    uint256 public proposalCount;

    DPollDAO public dpollDAO;
    address  public DAOAddress;
    DPollToken public DPTtoken;
    address public DPTtokenAddress;


    Value public votingDuration = Value(initialVotingDuration, 30 seconds, 4 weeks);
    // Value public executionDelay = Value(initialExecutionDelay, 30 seconds, 4 weeks);
    Value public creationDelay = Value(initialCreationDelay, 30 seconds, 4 weeks);
    // uint256 public distributedTokenCount; //unused now
    //@todo:to transform in mapping (bytes32 => bool) : list all updatable variables
    string[] internal updatableVariables;
    //max index is proposalCount
    mapping(uint256 => Proposal) public proposals; 
    // uint256[] public pendingProposalsId;


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
        DAOAddress = _DAOaddress;//payable(_DAOaddress);
        dpollDAO = DPollDAO(DAOAddress);

        DPTtokenAddress = _DPTtokenAddress;
        DPTtoken = DPollToken(DPTtokenAddress);
        // updatableVariables.push("ExecutionDelay");
        updatableVariables.push("VotingDuration");
    }

    /**
    @notice This function is used to create a proposal
    @param _title The title of the proposal
    @param _description The description of the proposal
    @param _purpose The type of the proposal
    @param _payloadString The string used in the payload
     */
    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _purpose,
        // address[] memory _payloadAddresses,
        // uint256[] memory _payloadUint256,
        string[] memory _payloadString
    ) public onlyMember onlyOncePer4Days {
        require(DPTtoken.balanceOf(msg.sender) >= minTokenToCreate, "Not enough vote power");

        proposalCount++; //begin at index 1
        Proposal storage proposal = proposals[proposalCount];

        proposal.id = proposalCount;
        proposal.title = _title;
        proposal.description = _description;
        proposal.purpose = _purpose;
        // proposal.state.status = ProposalStatus.CREATED;//default
        proposal.state.createdAt = block.timestamp;
        proposal.creator = msg.sender;
        // proposal.payload.payloadAddresses = _payloadAddresses;
        // proposal.payload.payloadUint256 = _payloadUint256;
        proposal.payload.payloadString = _payloadString;


        dpollDAO.rewardVoter(msg.sender); 
        emit ProposalChange(msg.sender, proposalCount, proposal.state.status);
    }


    function openProposal(uint256 _proposalId) public onlyMember() {
        require(DPTtoken.balanceOf(msg.sender) >= minTokenToVote, "Not enough vote power");
        require(proposals[_proposalId].creator != address(0), "Proposal does not exist");
        require(proposals[_proposalId].state.status == ProposalStatus.CREATED, "Proposal is not created");
        proposals[_proposalId].state.status = ProposalStatus.OPEN;

        dpollDAO.rewardVoter(msg.sender); 
        emit ProposalChange(msg.sender, _proposalId, proposals[_proposalId].state.status);

    }


    function vote(uint256 _proposalId, bool _vote) public onlyMember {
        // ProposalType proposalType = proposals[_proposalId].purpose;
        require(DPTtoken.balanceOf(msg.sender) >= minTokenToVote, "Not enough vote power");
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state.status == ProposalStatus.OPEN, "Poll is not open");
        require(proposal.voted[msg.sender] == false, "You already voted");
        proposal.voted[msg.sender] = true;
        proposal.state.votesTotal++;
        if (_vote) {
            proposal.state.votesFor++;
        } else {
            proposal.state.votesAgainst++;
        }
        
        dpollDAO.rewardVoter(msg.sender);

    }

    function closeProposal(uint256 _proposalId) public onlyMember {
        require(DPTtoken.balanceOf(msg.sender) >= minTokenToVote, "Not enough vote power");
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state.status == ProposalStatus.OPEN, "Poll is not open");
        // require(proposal.state.closedAt != 0, "Poll is already closed");
        require(proposal.state.createdAt + votingDuration.value < block.timestamp, "Voting period is not over");
        proposal.state.status = ProposalStatus.CLOSED;
        proposal.state.closedAt = block.timestamp;


        uint256 totalVotes = proposal.state.votesTotal;
        //Enough participants in regard to the membership count
        if ((totalVotes * 100 / dpollDAO.getMembersCount()) >= proposalPctQuorum) {
            //Enough votes for in regard to the total votes
            if ((proposal.state.votesFor * 100 / totalVotes) > minPctThreshold) {
                proposal.state.isAccepted = true;
            } 
        }

        dpollDAO.rewardVoter(msg.sender);
        emit ProposalChange(msg.sender, _proposalId, proposal.state.status);

    }

    function executeProposal(uint256 _proposalId) public onlyMember {
        require(DPTtoken.balanceOf(msg.sender) >= minTokenToVote, "Not enough vote power");

        Proposal storage proposal = proposals[_proposalId];
        require(proposal.state.status == ProposalStatus.CLOSED, "Poll is not closed");
        require(proposal.state.isAccepted == true, "Poll is not accepted");
        require(proposal.state.executedAt != 0, "Poll is already executed");
        // require(proposal.state.closedAt + executionDelay.value < block.timestamp, "Execution delay is not over");
        require(proposal.purpose != ProposalType.PROPOSAL, "Proposal is not an execution");
        proposal.state.status = ProposalStatus.EXECUTED;
        proposal.state.executedAt = block.timestamp;
        if (proposal.purpose == ProposalType.UPDATE_EXECUTION) {
            executeUpdate(_proposalId);
        }
        // else if (proposal.purpose == ProposalType.TRANSFERT_EXECUTION) {
        //     executeTransfert(_proposalId);
        // } else if (proposal.purpose == ProposalType.REVOCATION_EXECUTION) {
        //     executeRevocation(_proposalId);
        // }


        dpollDAO.rewardVoter(msg.sender);
        emit ProposalChange(msg.sender, _proposalId, proposal.state.status);
    }

//when eternal storage => compsotion name easier to get the variable in mapping
    //add check des range de vairbale possible
    function executeUpdate(uint256 _proposalId) internal onlyMember {
        ProposalPayload memory payload = proposals[_proposalId].payload;
        Value memory currentVotingDuration = votingDuration;
        // Value memory currentExecutionDelay = executionDelay;
        // Value memory currentCreationDelay = creationDelay;
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
            }
             //else if (variable == keccak256(abi.encodePacked("ExecutionDelay"))) {
            //     require(value >= currentExecutionDelay.min && value <= currentExecutionDelay.max, "Execution delay out of range");
            //     executionDelay.value = value;
            // } else if (variable == keccak256(abi.encodePacked("CreationDelay"))) {
            //     require(value >= currentCreationDelay.min && value <= currentCreationDelay.max, "Creation delay out of range");
            //     creationDelay.value = value;
            // }
        }
        emit ProposalExecution(_proposalId, ProposalType.UPDATE_EXECUTION);
    }

    //later use of mapping to get bytes32 of the variable => bool isUpdatable

    function checkUpdatableVariables(string[] memory _updatableVariables) internal view returns (bool) {
        string[] memory availableVariables = updatableVariables;
        uint availableVariablesLength = availableVariables.length;
        bool isUpdatable = false;
        for (uint256 i = 0; i < _updatableVariables.length; i++) {
            for (uint256 j = 0; j < availableVariablesLength; j++) {
                if (keccak256(abi.encodePacked(_updatableVariables[i])) == keccak256(abi.encodePacked(availableVariables[j]))) {
                    isUpdatable = true;
                } else {
                    // isUpdatable = false;
                    // break;
                    return false;
                }   
            }
            if (!isUpdatable) {
                // break;
                return false;
            }
        }
        return isUpdatable;
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
}

