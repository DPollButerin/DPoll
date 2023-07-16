// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title IDAOPollSubmission
@author ibourn
@notice this interface is used to interact with the DAO from the poll contract (DAO should implement this interface)
*/

interface IDAOPollSubmission {
    function submitPoll(address pollContractToValid) external;
}