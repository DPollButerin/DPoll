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


pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";
import "./DPollMember.sol";
import "./DPollVoting.sol";
import "./DPollToken.sol";
import "./IPollValidator.sol";
// import "./IDPollPluginValidator.sol";

contract DPollDAO is DPollVoting {
    //eth balance of the DAO
    // event PollStatusChange(address pollAddress, SubmissionStatus newStatus, string message);
    event DAOBalanceTansfer(address to, uint amount, string action);

    constructor() {
        DAObalance = 0;
        DPTtoken = new DPollToken(1_000_000);
        
        grantRole(msg.sender, MemberRole.OWNER);
    }

    function getDTPtokenAddress() public view returns (address) {
        return address(DPTtoken);
    }
    // IDPollPluginValidator public DAOPollValidator;
    address public DAOPollValidatorAddress;
    function setValidatorPluginAddress(address _pluginAddress) public onlyOwner {
        DAOPollValidatorAddress = _pluginAddress;
        // DAOPollValidator = DPollPluginValidator(DAOPollValidatorAddress);
    }

    address public DAOProposalsAddress;
    function setProposalsPluginAddress(address _pluginAddress) public onlyOwner {
        DAOProposalsAddress = _pluginAddress;
        // DAOPollValidator = DPollPluginValidator(DAOPollValidatorAddress);
    }
    // receive() external payable {
    //     //donation to the DAO
    //     deposit();
    // }

    // fallback() external payable {
    //     //donation to the DAO
    //     deposit();
    // }

    function deposit() public payable {
        require(msg.value > 0, "You need to send some Ether");
        DAObalance += msg.value;
    }

    function emergencyWithdraw() public onlyOwner {
        (bool success, ) = payable(msg.sender).call{value: DAObalance}("");
        require(success, "Transfer failed.");
        DAObalance = 0;
    }

    function getMembersCount() public view returns (uint) {
        return membersList.length;
    }

    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::

    //DAo receive the money and store the amount to split between validators and DAO
    //whan the validation is set the validators reward balance is updated
    //if the poll is unvalidated, the DAO amount is given back to the poll owner
    //en token
    //called by pluginValidator
    function rewardValidator(address _to) external {
        require(msg.sender == DAOPollValidatorAddress, "Only the validator contract can reward validators");
        rewardAction(_to);
    }
//called by pluginProposals
    function rewardVoter(address _to) external {
        require(msg.sender == DAOProposalsAddress, "Only the proposals contract can reward voters");
        rewardAction(_to);
    }

    function isMember(address _memberAddress) public view returns (bool) {
        return members[_memberAddress].role == MemberRole.MEMBER;
    }

    function payValidation(uint _amountToDAO, uint _amountToValidators, address[] memory _validators) external payable {
        require(msg.sender == DAOPollValidatorAddress, "Only the validator contract can reward validators");
        require(_amountToDAO + _amountToValidators <= msg.value, "The amount to split dont match the amount sent");
        DAObalance += _amountToDAO;
        uint amount = _amountToValidators / _validators.length;
        uint rest = _amountToValidators % _validators.length;
        
        for (uint i = 0; i < _validators.length; i++) {
            members[_validators[i]].rewardsBlance += amount;
            // DAObalance -= amount;
        }
        DAObalance += rest;
    }

        function withdrawReward() public {
        require(members[msg.sender].rewardsBlance > 0, "You don't have any reward");
        uint amount = members[msg.sender].rewardsBlance;
        members[msg.sender].rewardsBlance = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed.");

        emit DAOBalanceTansfer(msg.sender, amount, "Reward claimed");
    }
}
