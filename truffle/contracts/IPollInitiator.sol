// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title IPollInitiator
@author ibourn
@notice Interface to interact with the factory and create a new poll
 */
interface IPollInitiator {
    function createPollContract(
        // uint _duration,
        uint _requiredResponseCount,
        string calldata _pollName,
        string calldata _pollDescription,
        string calldata _eligibilityCriteria
  ) 
        external 
        payable  
        returns(address);
}