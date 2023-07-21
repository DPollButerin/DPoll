// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title PollUser
@author ibourn
@notice This contract contains the respondents functions
@notice results are not not cumulative but separate, as the owner could want to do a cross-data analysis
@notice addresses are not linked directly to answers
@dev The contract inherits from PollAdmin (and so from PollView, PollStorage, Ownable)
@dev (see PollMaster.sol for comments & explanations)
@inheritdoc Ownable
 */
import "./PollAdmin.sol";
import "./IPollUser.sol";
import "./Certifier.sol";

//IPollUser
contract PollUser is PollAdmin, IPollUser {


    // :::::::::::::::::::::::::: GETTERS :::::::::::::::::::::::::::::: //
//internal
    function getEligibility() public view returns (bool) {
        return Certifier(certifierAddress).getEligibilityProof(eligibilityCriteria, msg.sender) == PSEUDO_PROOF;
    }

    // :::::::::::::::::::::::::: SETTERS :::::::::::::::::::::::::::::: //

    /**
    @notice This function allow to answer to the poll
    @dev it update the balance of the respondent to allow him to claim the reward
    @dev index of choices start from 0 and should be ordered as the choices in the topics in order to revert earlier in case of invalid answer (function in helpers will revert later if not)
    @param _chosenChoices is an array of uint representing the index of the choices chosen by the respondent (in the order of the all choices and starting from 0)
     */
    function addAnswer(uint[] calldata _chosenChoices, bytes32 _eligibilityProof) external {
        require(pollStatus == PollStatus.PollingStarted, 'Polling not started');
        require(balances[msg.sender] == 0, 'Already answered');
        require(_chosenChoices.length <= totalChoicesCount, 'Wrong number of answers');
        require(getEligibility(), 'Not eligible');
        //check last num (index of choice) <= totalChoicesCount
        require(_chosenChoices[_chosenChoices.length - 1] < totalChoicesCount, 'Answer out of range');

        uint256 _answer = setBitsFromPositions(_chosenChoices);

        // respondents.push(msg.sender);
        answers.push(_answer);
        // responded[msg.sender] = true;

        _updateRespondentBalance(msg.sender);

    }

    /**
    @notice This function allow to claim the reward
    @dev it send the reward to the respondent
     */
    function claimReward() external {
        require(pollStatus == PollStatus.PollingEnded, 'Polling not ended');
        require(balances[msg.sender] != 0, 'Already claimed');
        require(balance >= balances[msg.sender], 'Not enough funds');
        uint amountToSend = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool res,) = msg.sender.call{value: amountToSend}("");
        require(res, "Transfer failed");

        emit PollWithdrawal(msg.sender, amountToSend, 'Reward claimed');
    }

    /**
    @notice this function update the balance of the respondent setting it to the amountToRespondent
    @dev it's a private function called by addAnswer
    @param _respondent is the address of the respondent
     */
    function _updateRespondentBalance(address _respondent) private {
    // require(responded[_respondent] == true, 'Not answered yet');
    require(balances[_respondent] == 0, 'Already updated');
    require(balance >= amountToRespondent, 'Not enough funds');
        balance -= amountToRespondent;
        balances[_respondent] += amountToRespondent;
    }
}