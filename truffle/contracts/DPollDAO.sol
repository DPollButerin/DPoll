// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
/*
 * This is the main contract of the DAO, later there will be a master for proposals implementing
 * new logic with the use of plugins (facets like) to allow upgradability and flexibility
 * 
 * At the moment, it contains :
 * -the logic for the DAO inheriting from other contracts
 * (see DPollMember.sol, DPollStorage.sol, DPollToken.sol, IPollValidator.sol, IDAOPollSubmission.sol for each part of the DAO)
 * -and here the DAO treasury management (replaced later by a vault contract)
 * -and the logic for Polls submission and validation
 * 
 * This step of the treasury is simple : 
 * -the DAO  receives funds and updates balance of member and treasury, members can then claim their rewards in token (for DAO actions) or ETH (for poll validation)
 * -the DAO acceptes ETH donation and an emergencyWithdraw function is implemented to allow the DAO to withdraw all the ETH (this is a POC only) 
 * -AT CREATION : the DAO creates and mints 1_000_000 DPT token. DAO has the total supply and can send it to members as rewards
 *
 * About Poll submissions : see DPollPluginValidator.sol managing this part, locking the fund till the poll is validated or not and then sending it to the DAO or back to the poll owner
 * About DAO proposals : see DPollPluginProposals.sol managing votes and their execution
 *
 * ATTENTION : in the purpose of this exam, the functionalities are limited to the minimum (to respect delay),
 * -all time constraints (delay, duration) concerning the polls validation are removed (to facilitate tests and live demo)
 * 
 * ABOUT MEMBERS BALANCES :
 * -member balance is the entry fees claimable later (28days of locking period), in this case to leave the DAO
 * -rewardsBalance is all eth fees gained for paid actions of the DAO (at the moment only for poll validators) claimable as soons as they are available
 * -DPT token is the governance token of the DAO, it is transfert directly to member when they're rewarded for their participation to the DAO
 * +It could later allow more complex incentives system to reward members (with stacking... and using it to ponderate their votes...)
 * +It allows to share a part of the DAO and later to trade it on a DEX
 *
 * -the tokenomics is not yet finished...
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



import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollStorage.sol";
import "./DPollMember.sol";
import "./DPollToken.sol";
import "./IPollValidator.sol";
// import "./IDPollPluginValidator.sol";

contract DPollDAO is DPollMember {
    //eth balance of the DAO
    // event PollStatusChange(address pollAddress, SubmissionStatus newStatus, string message);
    event DAOBalanceTansfer(address to, address from, uint amount, string action);
    event DAOTokenTransfer(address to, uint amount, string action);

    constructor() {
        DAObalance = 0;
        DPTtoken = new DPollToken(1_000_000 * 10 ** 18);
        
        grantRole(msg.sender, MemberRole.MEMBER);
    }

    function getDPTtokenAddress() public view returns (address) {
        return address(DPTtoken);
    }

    function getDAOBalance() public view returns (uint256) {
        return DAObalance;
    }

    function getValidatorPluginAddress() public view returns (address) {
        return DAOPollValidatorAddress;
    }
    function getProposalsPluginAddress() public view returns (address) {
        return DAOProposalsAddress;
    }
    //later, passed a delay or a proposal, only the DAO will be abble to call this function
    function setValidatorPluginAddress(address _pluginAddress) public onlyOwner {
        DAOPollValidatorAddress = _pluginAddress;
        // DAOPollValidator = DPollPluginValidator(DAOPollValidatorAddress);
    }

   
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
        emit DAOBalanceTansfer(address(this), msg.sender, msg.value, "Deposit");
    } 

    //:::::::::::::::::::::::::::: POLL SUBMISSION ::::::::::::::::::::::::
    function payValidation(uint _amountToDAO, uint _amountToValidators, address[] memory _validators) external payable {
        require(msg.sender == DAOPollValidatorAddress, "Only the validator contract can reward validators");
        require(_amountToDAO + _amountToValidators <= msg.value, "The amount to split dont match the amount sent");
        DAObalance += _amountToDAO;
        uint amount = _amountToValidators / _validators.length;
        uint rest = _amountToValidators % _validators.length;
        
        for (uint i = 0; i < _validators.length; i++) {
            members[_validators[i]].rewardsBalance += amount;
            // DAObalance -= amount;
        }
        DAObalance += rest;
    }

    function withdrawReward() public {
        require(members[msg.sender].rewardsBalance > 0, "You don't have any reward");
        uint amount = members[msg.sender].rewardsBalance;
        members[msg.sender].rewardsBalance = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed.");

        emit DAOBalanceTansfer(msg.sender, address(this), amount, "Reward claimed");
    }



    // function emergencyWithdraw() public onlyOwner {
    //     (bool success, ) = payable(msg.sender).call{value: DAObalance}("");
    //     require(success, "Transfer failed.");
    //     DAObalance = 0;
    // }

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


    function rewardAction(address _to) internal {
        require(_to != address(0), "Invalid address");
        require(members[_to].role == MemberRole.MEMBER, "Not member");
        //1token (18 decimals) for now
        DPTtoken.transfer(_to, 1 * 10 ** 18);


        emit DAOTokenTransfer(_to, 1 * 10 ** 18 , "Reward");
    }


}
