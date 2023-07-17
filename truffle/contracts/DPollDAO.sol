// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";
import "./DPollMember.sol";
import "./DPollVoting.sol";
import "./DPollToken.sol";
import "./IPollValidator.sol";

contract DPOllDAO is DPollVoting {
    //eth balance of the DAO
 



    constructor() {
        DAObalance = 0;
    }

    receive() external payable {
        //donation to the DAO
        deposit();
    }

    fallback() external payable {
        //donation to the DAO
        deposit();
    }

    function deposit() public payable {
        require(msg.value > 0, "You need to send some Ether");
        DAObalance += msg.value;
    }

    // partie concernant Poll contracts :
    // validator are member only
    // validator can be DAO or TEAM
    // validate a poll (yes or no) = + 1 DPTtoken
    //function submitPoll store poll address to allow validator to consult it
    //setPollValidation at address of Poll contract cat to IPollValidator allow validator to validate a poll (yes or no) 
    //validation delay is 1 week after poll receive in submitPoll
    //for now, we need 3 validators to validate a poll (yes or no) and 2 yes to validate a poll / only one result in no to invalidate a poll
    //submitPoll is the same as creating a vote with 3 validators on address of poll contract
    //flow of the vote will be : submitted => closed => validated 
    //close a submission is possible by any membre and give 1 DPTtoken to the closer (the dealy is 1 week after submission to permit close a submission)
    //later rules (mots banis, structure à respecter)
    enum SubmissionStatus {SUBMITTED, CLOSED, VALIDATED }

    struct PollSubmission {
        address pollAddress;
        uint256 submissionDate;
        uint256 voteCount;
        SubmissionStatus status;
        address[] validators;
    }

    uint256 public requiredValidators = 3;
    uint256 public requiredValidations = 2;
    uint256 public pollSubmissionDuration = 1 weeks;
    //better struct for validator to add mechanism//special member
    PollSubmission[] public pollSubmissions;

    //address qui envoir a submitPoll doit être la meme que celle qui est submitPoll
    function submitPoll(address _pollAddress) public {
        require(msg.sender == _pollAddress, "The Poll should submit itself");
        PollSubmission memory newPollSubmission;
        newPollSubmission.pollAddress = _pollAddress;
        newPollSubmission.submissionDate = block.timestamp;
        newPollSubmission.status = SubmissionStatus.SUBMITTED;
    }

    function voteForPoll(uint _pollSubmissionId, bool _vote) public {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        require(pollSubmissions[_pollSubmissionId].status == SubmissionStatus.SUBMITTED, "The poll is not submitted");
        require(pollSubmissions[_pollSubmissionId].submissionDate + pollSubmissionDuration < block.timestamp, "The poll submission is closed");
        require(pollSubmissions[_pollSubmissionId].validators.length < requiredValidators, "The poll submission is closed");
        
        pollSubmissions[_pollSubmissionId].validators.push(msg.sender);

        if (_vote) {
            pollSubmissions[_pollSubmissionId].voteCount++;
        }

        DPTtoken.transfer(msg.sender, 1);
    }

    function closeSubmission(uint _pollSubmissionId) public {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        require(pollSubmissions[_pollSubmissionId].status == SubmissionStatus.SUBMITTED, "The poll is not submitted");
        require(pollSubmissions[_pollSubmissionId].submissionDate + pollSubmissionDuration <= block.timestamp, "The poll submission is closed");
        require(pollSubmissions[_pollSubmissionId].validators.length >= requiredValidators, "The poll submission is not validated");
        
        pollSubmissions[_pollSubmissionId].status = SubmissionStatus.CLOSED;
        DPTtoken.transfer(msg.sender, 1);
    }

    function setValidation(uint _pollSubmissionId) public {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        require(pollSubmissions[_pollSubmissionId].status == SubmissionStatus.CLOSED, "The poll is not closed");
        require(pollSubmissions[_pollSubmissionId].validators.length >= requiredValidators, "The poll submission is not validated");
        
        bool isValid = pollSubmissions[_pollSubmissionId].voteCount >= requiredValidations;

        IPollValidator(pollSubmissions[_pollSubmissionId].pollAddress).setPollValidation(pollSubmissions[_pollSubmissionId].pollAddress, isValid);

        DPTtoken.transfer(msg.sender, 1);
    }

    

}