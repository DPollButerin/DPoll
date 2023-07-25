// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;


/**
@title PollView
@author ibourn
@notice This contract contains all the getters of the poll contract 
@dev it inherits from PollStorage to access the state variables
@dev (see PollMaster.sol for comments & explanations)
@inheritdoc Ownable
 */

import "./PollStorage.sol";
import "./IPollView.sol";

contract PollView is PollStorage, IPollView {

    // :::::::::::::::::::::::::: GETTERS :::::::::::::::::::::::::::::: //
    // function getTimestampLimit() external view returns (uint) {
    //     return timestampLimit;
    // }

    function getRequiredResponseCount() external view returns (uint) {
        return requiredResponseCount;
    }

    function getRespondentsCount() external view returns (uint) {
        return answers.length;
    }

    function getPollInformations() external view returns (string memory, string memory) {
        return (pollName, pollDescription);
    }

    function getBalance() external view returns (uint) {
        return balance;
    }

    function getAmountToRespondent() external view returns (uint) {
        return amountToRespondent;
    }

    function getAmountToDAO() external view returns (uint) {
        return amountToDAO;
    }

    function getAmountToValidators() external view returns (uint) {
        return amountToValidators;
    }

    function getRespondentReward() external view returns (uint) {
        return balances[msg.sender];
    }

    function getPollStatus() external view returns (PollStatus) {
        return pollStatus;
    }
    //test clone call via int
    function getPollStatusExt() external view returns (uint8) {
        return uint8(pollStatus);
    }
    function getIsCanceled() external view returns (bool) {
        return isCanceled;
    }


    function getTopic(uint _id) external view returns (Topic memory) {
        return topics[_id];
    }

    function getTopicsLength() external view returns (uint) {
        return topics.length;
    }

    function getTopics() external view returns (Topic[] memory) {
        return topics;
    }

  
}