// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../node_modules/@openzeppelin/contracts/proxy/Clones.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./IPollInitiator.sol"; 
import "./PollMaster.sol";

/*
This contract is not intended to be deployed on the mainnet, it is only used to test internals functions and helpers of Poll contracts
*/
/**
@title TestPollHelper
@author ibourn
@notice This contract is not intended to be deployed on the mainnet, it is only used to test internals functions and helpers of Poll contracts
@dev The contract inherits from PollUser (and so from PollAdmin, PollView, PollHelpers, PollStorage)
@dev each internal function of PollMaster will be called in external functions named as 'test' + the name of the function to test
@dev setters are added to test the storage and getters before the use by other calinng function in the regular process of the poll
 */
contract TestPollHelper is PollUser {


    // ::::::::::::::::::::::: MOCKED SETTERS TO TEST EXTERNAL GETTERS in PollView :::::::::::::::::::::::::::::::::: //
    // function setTimestampLimit(uint _timestampLimit) external {
    //     timestampLimit = _timestampLimit;
    // }

    function setRequiredResponseCount(uint _requiredResponseCount) external {
        requiredResponseCount = _requiredResponseCount;
    }

    function setRespondentsCount(uint _respondentsCount) external {
        uint256[] memory _answers = new uint256[](_respondentsCount);
        answers = _answers;
    }

    function setPollInformations(string calldata _pollName, string calldata _pollDescription) external {
        pollName = _pollName;
        pollDescription = _pollDescription;
    }

    function setBalance(uint _balance) external {
        balance = _balance;
    }

    function setAmountToRespondent(uint _amountToRespondent) external {
        amountToRespondent = _amountToRespondent;
    }

    function setAmountToDAO(uint _amountToDAO) external {
        amountToDAO = _amountToDAO;
    }

    function setAmountToValidators(uint _amountToValidators) external {
        amountToValidators = _amountToValidators;
    }

    function setPollStatus(PollStatus _pollStatus) external {
        pollStatus = _pollStatus;
    }

    function setIsCanceled(bool _isCanceled) external {
        isCanceled = _isCanceled;
    }

    // function setTopics(Topic[] calldata _topics) external {
    //     topics = _topics;
    // }
    function setTopic(string calldata _question, string[] memory _choices) public {
        uint choiceCount = totalChoicesCount;
        Topic memory topic;
        topic.firstChoiceIndex = choiceCount;
        topic.question = _question;
        topic.choices = _choices;
        totalChoicesCount += _choices.length;
        topics.push(topic);
    }

    function setTopics(uint[] calldata choicesPerTopic, string[] calldata questions, string[] calldata choices) external {
        require(choicesPerTopic.length == questions.length, 'Wrong number of questions');
        Topic[] memory _topics = new Topic[](questions.length);
        uint counter =0;
        for (uint i = 0; i < choicesPerTopic.length; i++) {
                          string[] memory newchoices = new string[](choicesPerTopic[i]);

            for (uint j = 0; j < choicesPerTopic[i]; j++) {
              newchoices[j] = choices[counter + j];
            }
            counter += choicesPerTopic[i];
            setTopic(questions[i], newchoices);
        }
    }

    function setAnswers(uint[] calldata _answers) external {
        answers = _answers;
    }

 
    // ::::::::::::::::::::::: EXTERNAL FUNCTION TO TEST PollHelper :::::::::::::::::::::::::::::::::::::::::::::::::::: //

    function testSetBitsFromPositions(uint[] calldata _chosenChoices) external pure returns(uint256) {
        return setBitsFromPositions(_chosenChoices);
    }

    function testGetSetBitsCount(uint256 _number) external pure returns(uint256) {
        return getSetBitsCount(_number);
    }

    function testGetSetBitsPositions(uint256 _number) external pure returns(uint256[] memory) {
        return getSetBitsPositions(_number);
    }


}