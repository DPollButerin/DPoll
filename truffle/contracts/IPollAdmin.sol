// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title IPollAdmin
@author ibourn
@notice This interface is used to interact with the poll as an admin
 */
interface IPollAdmin {
    function addTopic(string calldata _question, string[] calldata _choices) external;
    function addTopicsBatch(string[] calldata _questions, string[][] calldata _choices) external;

    function submitPoll() external;
    function endPoll() external;
    function claimRefund() external;

    function getSelectedChoicesByAnswer(uint _answerId) external view returns (uint[] memory);
    function getPackedAnswers() external view returns (uint[] memory);
    function getUnpackedAnswers() external view returns (uint[][] memory);
}