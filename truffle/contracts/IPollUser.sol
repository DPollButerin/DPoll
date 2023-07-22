// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title IPollUser
@author ibourn
@notice This contract allow to interact with the poll as a respondent
 */

interface IPollUser {
    function addAnswer(uint[] calldata _chosenChoices, bytes32 _eligibilityProof) external;
    function claimReward() external;
}