// SPDX-License-Identifier: MIT

/*
 * This is the main contract of the DAO, later there will be a master for proposals implementing
 * new logic with the use of plugins (facets like) to allow upgradability and flexibility
 * 
 * At the moment, it contains :
 * -the logic for the DAO inheriting from other contracts
 * -and here the DAO treasury management (replaced later by a vault contract)
 * -and the logic for Polls submission and validation
 * (see DPollMember.sol, DPollVoting.sol, DPollStorage.sol, DPollToken.sol, IPollValidator.sol, IDAOPollSubmission.sol for each part of the DAO)
 * 
 * This step of the treasury is simple : 
 * -the DAO (in member contract) receive, lock and unlock ETH 
 * -the DAO accepte ETH donation and an emergencyWithdraw function is implemented to allow the DAO to withdraw all the ETH (this is a POC only) 
 *
 * About the Polls submission and validation :
 * -a poll owner can submit a poll to the DAO by sending its address and some ETH to the DAO (50% will be given to validators, 50% to the treasury if the poll is validated)
 * -the DAO members can vote for the poll
 * -a certain amount of vote is required to close the poll (3 as example for now) (later : in a certain delay)
 * -then the DAO members can validate or invalidate the poll calling the setValidation function of the PollValidator contract
 *
 * ATTENTION : in the purpose of this exam, the functionalities are limited to the minimum (to respect delay),
 * -all time constraints (delay, duration) concerning the polls validation are removed (to facilitate tests and live demo)
 * 
 * 
 * @todo :
 * -for next versions :
 * +a process to disable the emergencyWithdraw function will be implemented, as well as pausable modifier and process to renonce to ownership and disable the team acces...
 * +a multisig wallet will be implemented to allow the team to manage the DAO treasury the time to time test the dapp and the DAO, this multisig will be disabled later
 * +a better management and naming of role and access 
 * +more settings available to be updated or added by the DAO as well as plugins (google like contracts for example...)
 * +more complex incentives system to reward members and validators and a stacking mechanism with the use of the treasury
 * +a separation of the funds locked to pay services, communications, dev... and those used to inject in defi protocols to generate interests (... tokenomics not yet finished)
 *
 */


/*plugin de DAO pour valider les polls*/

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";
import "./DPollMember.sol";
import "./DPollVoting.sol";
import "./DPollToken.sol";
import "./IPollValidator.sol";
import "./DPollDAO.sol";

contract DPollPluginValidator  {
    //eth balance of the DAO
    event PollStatusChange(address pollAddress, SubmissionStatus newStatus, string message);
    event DAOBalanceTansfer(address to, uint amount, string action);

    enum SubmissionStatus {SUBMITTED, CLOSED, VALIDATED }

    struct PollSubmission {
        address pollAddress;
        uint256 submissionDate;
        uint256 voteCount;
        uint256 amountToDAO;
        uint256 amountToValidators;
        SubmissionStatus status;
        address[] validators;
    }

    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::

    uint256 public requiredValidators = 3;
    uint256 public requiredValidations = 2;
    uint256 public pollSubmissionDuration = 1 weeks;

    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::
    PollSubmission[] public pollSubmissions;


    // fake
    //     DPollToken public DPTtoken;

    //    modifier onlyMember() {
    //     require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
    //     _;
    // }

//     uint public DAObalance;
//       enum MemberRole {GUEST, DAO, TEAM, OWNER, MEMBER}
// //change to ProposalStatus
//     enum PollStatus {CREATED, OPEN, CLOSED, EXECUTED}
//     enum ProposalType { PROPOSAL, UPDATE_EXECUTION, TRANSFERT_EXECUTION, REVOCATION_EXECUTION }


    // struct Member {
    //     address memberAddress;
    //     uint256 memberSince;
    //     uint256 lastProposalCreation;
    //     uint256 balance;
    //     uint256 rewardsBlance;
    //     MemberRole role;
    // }
//     Member[] public membersList;
// mapping(address => Member) public members;

//    function rewardAction() public onlyMember {
//         DPTtoken.transfer(msg.sender, 1);
//     }
    // constructor() {
    //     DAObalance = 0;
    //     DPTtoken = new DPollToken(1_000_000);
    //     grantRole(msg.sender, MemberRole.OWNER);
    // }

    // receive() external payable {
    //     //donation to the DAO
    //     deposit();
    // }

    // fallback() external payable {
    //     //donation to the DAO
    //     deposit();
    // }

    // function deposit() public payable {
    //     require(msg.value > 0, "You need to send some Ether");
    //     DAObalance += msg.value;
    // }

    // function emergencyWithdraw() public onlyOwner {
    //     (bool success, ) = payable(msg.sender).call{value: DAObalance}("");
    //     require(success, "Transfer failed.");
    //     DAObalance = 0;
    // }
    DPollDAO public dpollDAO;
    address payable public DAOAddress;

    constructor(address _DAOaddress) {
        DAOAddress = payable(_DAOaddress);
        dpollDAO = DPollDAO(DAOAddress);
    }
    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::

    //DAo receive the money and store the amount to split between validators and DAO
    //whan the validation is set the validators reward balance is updated
    //if the poll is unvalidated, the DAO amount is given back to the poll owner

    function submitPoll(address _pollAddress, uint _toValidators, uint _toDAO) external payable {
        uint totalRecieved = _toValidators + _toDAO;
        require(msg.sender == _pollAddress, "The Poll should submit itself");
        require(msg.value >= 0.01 ether, "You need to send some Ether"); //min poll is 0.05 and 10% to validators 10% to DAO
        require(msg.value >= totalRecieved, "Amount sent didn't match inputs"); //min poll is 0.05 and 10% to validators 10% to DAO
        PollSubmission memory newPollSubmission;
        newPollSubmission.pollAddress = _pollAddress;
        // newPollSubmission.submissionDate = block.timestamp;
        newPollSubmission.status = SubmissionStatus.SUBMITTED;
        newPollSubmission.amountToDAO = _toDAO;
        newPollSubmission.amountToValidators = _toValidators;
        if (msg.value > totalRecieved) {
            newPollSubmission.amountToDAO = msg.value - totalRecieved;
        }
        // DAObalance += msg.value;
        emit PollStatusChange(_pollAddress, SubmissionStatus.SUBMITTED, "Poll submitted");
    }

    function voteForPoll(uint _pollSubmissionId, bool _vote) public {
        require(dpollDAO.isMember(msg.sender), "You are not a member");
        PollSubmission storage pollSubmission = pollSubmissions[_pollSubmissionId];
        require(pollSubmission.status == SubmissionStatus.SUBMITTED, "The poll is not submitted");
        // require(pollSubmission.submissionDate + pollSubmissionDuration < block.timestamp, "The poll submission is closed");
        require(pollSubmission.validators.length < requiredValidators, "The poll submission is closed");
        
        pollSubmission.validators.push(msg.sender);

        if (_vote) {
            pollSubmission.voteCount++;
        }

        dpollDAO.rewardValidator(msg.sender);
    }

    //due to restriction and later time constraints, no modifier to allow automatisation of the workflow
    function closeSubmission(uint _pollSubmissionId) public {
        require(dpollDAO.isMember(msg.sender), "You are not a member");
        PollSubmission storage pollSubmission = pollSubmissions[_pollSubmissionId];
        require(pollSubmission.status == SubmissionStatus.SUBMITTED, "The poll is not submitted");
        // require(pollSubmission.submissionDate + pollSubmissionDuration <= block.timestamp, "The poll submission is closed");
        require(pollSubmission.validators.length >= requiredValidators, "The poll submission is not finished");
        
        pollSubmission.status = SubmissionStatus.CLOSED;
        dpollDAO.rewardValidator(msg.sender);
        emit PollStatusChange(pollSubmission.pollAddress, SubmissionStatus.CLOSED, "Poll closed");
    }

    function setValidation(uint _pollSubmissionId) public {
        require(dpollDAO.isMember(msg.sender), "You are not a member");
        PollSubmission storage pollSubmission = pollSubmissions[_pollSubmissionId];
        require(pollSubmission.status == SubmissionStatus.CLOSED, "The poll is not closed");
        
        bool isValid;
        uint amountBack;
        uint daoAmount;
        // rewardValidators(pollSubmission.amountToValidators, pollSubmission.validators);

        if(pollSubmission.voteCount >= requiredValidations) {
            isValid = true;
            daoAmount = pollSubmission.amountToDAO;
        } else {
            isValid = false;
            amountBack = pollSubmission.amountToDAO;
        }
        dpollDAO.payValidation{value: daoAmount + pollSubmission.amountToValidators}(daoAmount, pollSubmission.amountToValidators, pollSubmission.validators);
        //refund Poll if not validated (send back DAO fees, Validators fees are already given to pay htem)
        IPollValidator(pollSubmission.pollAddress).setPollValidation{value: amountBack}(pollSubmission.pollAddress, isValid);

        dpollDAO.rewardValidator(msg.sender);

        emit PollStatusChange(pollSubmission.pollAddress, SubmissionStatus.VALIDATED, "Poll validated");
    }

    //^pay validator no matter the result, the result of the division is gievn to the DAO
    // function rewardValidators(uint _amount, address[] memory _validators) internal {
    //     uint amount = _amount / _validators.length;
    //     uint rest = _amount % _validators.length;
    //     for (uint i = 0; i < _validators.length; i++) {
    //         members[_validators[i]].rewardsBlance += amount;
    //         DAObalance -= amount;
    //     }
    //     DAObalance += rest;
    // }



    

}