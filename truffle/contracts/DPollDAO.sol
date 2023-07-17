// SPDX-License-Identifier: MIT

/*
This is the main contract of the DAO, later there will be a master for proposals implementing
new logic with the use of plugins (facets like) to allow upgradability and flexibility

At the moment, it contains :
-the logic for the DAO inheriting from other contracts
-and here the DAO treasury management (replaced later by a vault contract)
-and the logic for Polls submission and validation
(see DPollMember.sol, DPollVoting.sol, DPollStorage.sol, DPollToken.sol, IPollValidator.sol, IDAOPollSubmission.sol for each part of the DAO)

This step of the treasury is simple : 
-the DAO (in member contract) receive, lock and unlock ETH 
-the DAO accepte ETH donation and an emergencyWithdraw function is implemented to allow the DAO to withdraw all the ETH (this is a POC only)

About the Polls submission and validation :
-a poll owner can submit a poll to the DAO by sending its address and some ETH to the DAO (50% will be given to validators, 50% to the treasury if the poll is validated)
-the DAO members can vote for the poll
-a certain amount of vote is required to close the poll (3 as example for now) in a certain delay 
-then the DAO members can validate or invalidate the poll calling the setValidation function of the PollValidator contract

@todo :
-for next versions :
+a process to disable the emergencyWithdraw function will be implemented, as well as pausable modifier and process to renonce to ownership and disable the team acces...
+a multisig wallet will be implemented to allow the team to manage the DAO treasury the time to time test the dapp and the DAO, this multisig will be disabled later
+a better management and naming of role and access 
+more settings available to be updated or added by the DAO as well as plugins (google like contracts for example...)
+more complex incentives system to reward members and validators and a stacking mechanism with the use of the treasury
+a separation of the funds locked to pay services, communications, dev... and those used to inject in defi protocols to generate interests (... tokenomics not yet finished)

*/


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

    function emergencyWithdraw() public onlyOwner {
        (bool success, ) = payable(msg.sender).call{value: DAObalance}("");
        require(success, "Transfer failed.");
        DAObalance = 0;
    }

    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::

    //DAo receive the money and store the amount to split between validators and DAO
    //whan the validation is set the validators reward balance is updated
    //if the poll is unvalidated, the DAO amount is given back to the poll owner

    function submitPoll(address _pollAddress, uint _toValidators, uint _toDAO) external payable {
        require(msg.sender == _pollAddress, "The Poll should submit itself");
        require(msg.value > 0.1 ether, "You need to send some Ether");
        PollSubmission memory newPollSubmission;
        newPollSubmission.pollAddress = _pollAddress;
        newPollSubmission.submissionDate = block.timestamp;
        newPollSubmission.status = SubmissionStatus.SUBMITTED;
        newPollSubmission.amountToDAO = _toDAO;
        newPollSubmission.amountToValidators = _toValidators;
        DAObalance += msg.value;
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

        rewardAction();
    }

    function closeSubmission(uint _pollSubmissionId) public {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        require(pollSubmissions[_pollSubmissionId].status == SubmissionStatus.SUBMITTED, "The poll is not submitted");
        require(pollSubmissions[_pollSubmissionId].submissionDate + pollSubmissionDuration <= block.timestamp, "The poll submission is closed");
        require(pollSubmissions[_pollSubmissionId].validators.length >= requiredValidators, "The poll submission is not validated");
        
        pollSubmissions[_pollSubmissionId].status = SubmissionStatus.CLOSED;
        rewardAction();
    }

    function setValidation(uint _pollSubmissionId) public {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        require(pollSubmissions[_pollSubmissionId].status == SubmissionStatus.CLOSED, "The poll is not closed");
        require(pollSubmissions[_pollSubmissionId].validators.length >= requiredValidators, "The poll submission is not validated");
        
        bool isValid;
        uint amount;
        rewardValidators(pollSubmissions[_pollSubmissionId].amountToValidators, pollSubmissions[_pollSubmissionId].validators);

        if(pollSubmissions[_pollSubmissionId].voteCount >= requiredValidations) {
            isValid = true;
        } else {
            isValid = false;
            amount = pollSubmissions[_pollSubmissionId].amountToDAO;
        }

        IPollValidator(pollSubmissions[_pollSubmissionId].pollAddress).setPollValidation{value: amount}(pollSubmissions[_pollSubmissionId].pollAddress, isValid);

        rewardAction();
    }

    //^pay validator no matter the result, the result of the division is gievn to the DAO
    function rewardValidators(uint _amount, address[] memory _validators) internal {
        uint amount = _amount / _validators.length;
        uint rest = _amount % _validators.length;
        for (uint i = 0; i < _validators.length; i++) {
            members[_validators[i]].rewardsBlance += amount;
            DAObalance -= amount;
        }
        DAObalance += rest;
    }

    function withdrawReward() public {
        require(members[msg.sender].rewardsBlance > 0, "You don't have any reward");
        uint amount = members[msg.sender].rewardsBlance;
        members[msg.sender].rewardsBlance = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed.");
    }

    

}