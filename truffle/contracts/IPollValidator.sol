// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title IPollValidator
@author ibourn
@notice This interface is used to interact with the poll as a validator from the DAO with the address of the poll
 */

interface IPollValidator {
    function setPollValidation(address pollAddress, bool isValid) external payable;
}