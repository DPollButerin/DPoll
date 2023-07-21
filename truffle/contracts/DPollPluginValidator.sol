// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
 /*
  * For this exam :
  * -Validation of poll are keeped simple : 3 validators are required to validate a poll and 2 voting for to validate it
  * -Time constraints are removed to facilitate tests and live demo
  * 
  * -the flow is :
  * +a poll is submitted to the DAO by sending its address and some ETH to the DAO (50% will be given to validators, 50% to the treasury if the poll is validated)
  * +DAO members can vote for the poll
  * +a certain amount of vote is required to close the poll (3 as example for now) (later : in a certain delay)
  * +then the DAO members can validate or invalidate the poll calling the setValidation function of the PollValidator contract
  *
  * -in case of validation of the poll : the plugin send the funds to the DAO to pay validators and DAO (updating the balances to be claim later)
  * -in case of invalidation of the poll : the plugin send the funds to the DAO to pay validator fees (updating the balances to be claim later) and 
  * send back the DAO fees to the poll when calling the setPollValidation function of the poll (the poll can claim it later)
  */

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IPollValidator.sol";
import "./DPollDAO.sol";

/**
@title DPollPluginValidator
@author ibourn
@notice This contract is used to manage the polls validation
@dev This contract is a plugin for the DAO, it is used to validate or invalidate a poll. It's splitted as a plugin to allow upgradability and flexibility and to reduce the size of the DAO contract
 */

contract DPollPluginValidator  {
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

    DPollDAO public dpollDAO;
    address public DAOAddress;

    uint256 public constant requiredValidators = 3;
    uint256 public constant requiredValidations = 2;
    uint256 public constant pollSubmissionDuration = 1 weeks;

    PollSubmission[] public pollSubmissions;
    mapping(address => uint256) public pollSubmissionIds;
    mapping (address => mapping (uint256 => bool)) public validatorsVotes;

    modifier onlyDAOmember() {
        require(dpollDAO.isMember(msg.sender), "You are not a member");
        _;
    }
    modifier onlySelfSubmit(address _pollAddress) {
        require(msg.sender == _pollAddress, "The Poll should submit itself");
        _;
    }
    modifier onlyExisting(uint _pollSubmissionId) {
        require(_pollSubmissionId < pollSubmissions.length, "The poll does not exist");
        _;
    }


    constructor(address _DAOaddress) {
        DAOAddress = _DAOaddress;
        dpollDAO = DPollDAO(DAOAddress);
    }

    function submitPoll(address _pollAddress, uint _toValidators, uint _toDAO) external payable onlySelfSubmit(_pollAddress) {
        uint totalRecieved = _toValidators + _toDAO;
        uint pollSubmissionId = pollSubmissionIds[_pollAddress];
        if (pollSubmissions.length != 0 ) {
             if (pollSubmissionId != 0 || (pollSubmissions[pollSubmissionId].pollAddress != address(0))) {
                revert ("Poll already submitted");
          }
        } 
        if (msg.value < 0.01 ether || msg.value < totalRecieved) {
            revert ("Not enough funds");
        }

        PollSubmission memory newPollSubmission;
        newPollSubmission.pollAddress = _pollAddress;
        // newPollSubmission.submissionDate = block.timestamp;
        // newPollSubmission.status = SubmissionStatus.SUBMITTED;//default
        newPollSubmission.amountToDAO = _toDAO;
        newPollSubmission.amountToValidators = _toValidators;
        if (msg.value > totalRecieved) {
            newPollSubmission.amountToDAO = msg.value - totalRecieved;
        }
        pollSubmissions.push(newPollSubmission);
        pollSubmissionIds[_pollAddress] = pollSubmissions.length - 1;
        
        emit PollStatusChange(_pollAddress, SubmissionStatus.SUBMITTED, "Poll submitted");
    }

    function voteForPoll(uint _pollSubmissionId, bool _vote) public onlyDAOmember() onlyExisting(_pollSubmissionId) {

        PollSubmission storage pollSubmission = pollSubmissions[_pollSubmissionId];
        require(pollSubmission.status == SubmissionStatus.SUBMITTED, "The poll is not submitted");
        // require(pollSubmission.submissionDate + pollSubmissionDuration < block.timestamp, "The poll submission is closed");
        require(pollSubmission.validators.length < requiredValidators, "Already enough votes");
        require(!validatorsVotes[msg.sender][_pollSubmissionId], "Already voted");
        
        pollSubmission.validators.push(msg.sender);
        validatorsVotes[msg.sender][_pollSubmissionId] = true;

        if (_vote) {
            pollSubmission.voteCount++;
        }

        dpollDAO.rewardValidator(msg.sender);
    }

    //due to restriction and later time constraints, no modifier to allow automatisation of the workflow
    function closeSubmission(uint _pollSubmissionId) public onlyDAOmember() onlyExisting(_pollSubmissionId) {
        PollSubmission storage pollSubmission = pollSubmissions[_pollSubmissionId];
        require(pollSubmission.status == SubmissionStatus.SUBMITTED, "The poll is not submitted");
        // require(pollSubmission.submissionDate + pollSubmissionDuration <= block.timestamp, "The poll submission is closed");
        require(pollSubmission.validators.length >= requiredValidators, "The poll submission is not finished");
        
        pollSubmission.status = SubmissionStatus.CLOSED;
        dpollDAO.rewardValidator(msg.sender);
        emit PollStatusChange(pollSubmission.pollAddress, SubmissionStatus.CLOSED, "Poll closed");
    }

    function setValidation(uint _pollSubmissionId) public onlyDAOmember() onlyExisting(_pollSubmissionId) {
        PollSubmission storage pollSubmission = pollSubmissions[_pollSubmissionId];
        require(pollSubmission.status == SubmissionStatus.CLOSED, "The poll is not closed");
        require(address(this).balance >= pollSubmission.amountToDAO + pollSubmission.amountToValidators, "Not enough funds");
        
        //default state : poll not validated
        bool isValid;
        uint amountBack = pollSubmission.amountToDAO;
        uint daoAmount;

        if(pollSubmission.voteCount >= requiredValidations) {
            isValid = true;
            daoAmount = pollSubmission.amountToDAO;
            amountBack = 0;
        } 

        //Send fund to pay validators (and DAO if validated)
        dpollDAO.payValidation{value: daoAmount + pollSubmission.amountToValidators}(daoAmount, pollSubmission.amountToValidators, pollSubmission.validators);
        
        //Set validation state of the poll and refund from DAO fees if not validated
        IPollValidator(pollSubmission.pollAddress).setPollValidation{value: amountBack}(pollSubmission.pollAddress, isValid);

        dpollDAO.rewardValidator(msg.sender);
        emit PollStatusChange(pollSubmission.pollAddress, SubmissionStatus.VALIDATED, "Poll validated");
    }
    

}