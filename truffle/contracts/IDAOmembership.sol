// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;


//@todo add events to membership actions
interface IDAOmembership  {
 

    function isMemberExtCall(address _memberAddress) external view returns (bool);
}