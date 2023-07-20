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

contract PollView is PollStorage {

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