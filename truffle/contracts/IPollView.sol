// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title IPollView
@author ibourn
@notice This interface is used to interact with the poll as a viewer
 */
interface IPollView {
    function getRequiredResponseCount() external view returns (uint);
    function getRespondentsCount() external view returns (uint);
    function getPollInformations() external view returns (string memory, string memory);
    function getBalance() external view returns (uint);
    function getAmountToRespondent() external view returns (uint);
    function getAmountToDAO() external view returns (uint);
    function getAmountToValidators() external view returns (uint);
    function getRespondentReward() external view returns (uint);
    function getPollStatusExt() external view returns (uint8);
    function getIsCanceled() external view returns (bool);
//     function getTopic(uint _id) external view returns (Topic memory);
//     function getTopicsLength() external view returns (uint);
//     function getTopics() external view returns (Topic[] memory);
//   // }




}