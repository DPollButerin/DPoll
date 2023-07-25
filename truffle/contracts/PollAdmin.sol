// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title PollAdmin
@author ibourn
@notice This contract allow manage the poll
@dev The contract inherits from PollView, PollHelpers, Ownable
@dev (see PollMaster.sol for comments & explanations)
@inheritdoc Ownable

@todo : add a message to explain the rejection in setPollValidation()
 */
import "./PollHelpers.sol";
import "./PollView.sol";
import "./IDAOPollSubmission.sol";
import "./IPollAdmin.sol";
import "./IPollValidator.sol";

contract PollAdmin is PollView, PollHelpers, IPollAdmin, IPollValidator {

    event PollWithdrawal(address _to, uint _amount, string _message);
    event PollStatusChange(PollStatus previousStatus, PollStatus newStatus);
    //no topics in log cause owner may want to not disclose the questions early
    event TopicsAdded(uint topicsAdded, uint topicsCount, uint totalChoicesCount);

    modifier onlyDao() {
        require(msg.sender == DAOaddress, 'Only DAO can call this function');
        _;
    }

    // :::::::::::::::::::::::::: GETTERS :::::::::::::::::::::::::::::: //
//ATTENTION MISSING REQUIRE... (like checking if id exist!!!!!)
    /**
    @notice This function return the selected choices of topics of a respondent
    @dev one answer is a uint256 where each bit represent an available choice : 1 is selected, 0 is not selected
    @param _answerId is the index of the answer in the answers array
    @return an array of uint representing the selected choices of the respondent (in the order of all choices in topics)
     */
    function getSelectedChoicesByAnswer(uint _answerId) public view onlyOwner returns (uint[] memory) {
        require(pollStatus == PollStatus.PollingEnded, 'Polling not ended');
        return getSetBitsPositions(answers[_answerId]);
    }
  
    /**
    @notice get all the answers of the poll
    @dev answers are packed so each answer is a uint flagging the choices of the respondent
    @return answers is an array of uint representing the answers of the poll
     */
    function getPackedAnswers() external view onlyOwner returns (uint[] memory) {
                require(pollStatus == PollStatus.PollingEnded, 'Polling not ended');
        return answers;
    }
    
    /*
    @todo: optimise the loop (here we acces in the called function to storage), by giving a pointer or copying the array
     */
    /**
    @notice get all the answers of the poll
    @dev answers are unpacked so each result is the index of a choice selected by a respondent
    @dev call getSelectedChoicesByAnswer() to get the selected choices of a respondent
    @dev use answers.length to get the number of respondents
    @return an array of all respondets answers as an array of uint corresponding to the index of the choices selected by the respondent (reading :[choices][respondents])
     */
    function getUnpackedAnswers() external view onlyOwner returns (uint[][] memory) {
                require(pollStatus == PollStatus.PollingEnded, 'Polling not ended');
        uint answersCount = answers.length;
        uint[][] memory _answers = new uint[][](answersCount);
        for(uint i; i < answersCount; i ++) {
            _answers[i] = getSelectedChoicesByAnswer(i);
        }
        return _answers;
    }


    // :::::::::::::::::::::::::: SETTERS :::::::::::::::::::::::::::::: //
    /**
    @notice This function allows to add a topic : a question and its choices
    @dev the choices are an array of string
    @param _question is the question of the topic
    @param _choices is an array of string representing the choices of the topic
     */
    function addTopic(string calldata _question, string[] calldata _choices) external onlyOwner {
        require(pollStatus == PollStatus.PollInitialized, 'Poll already submitted');
        require(_choices.length <= MAX_CHOICES_LENGTH, 'Too many choices');
        require(totalChoicesCount + _choices.length <= MAX_TOPICS_LENGTH, 'Too many topics');

        Topic memory topic;
        topic.firstChoiceIndex = totalChoicesCount;
        topic.question = _question;
        topic.choices = _choices;
        totalChoicesCount += _choices.length;
        
        topics.push(topic);

        emit TopicsAdded(1, topics.length, totalChoicesCount);
    }


    // function addTopics(Topic[] calldata _topics) external onlyOwner {
    //     for (uint i = 0; i < _topics.length; i++) {
    //         topics.push(_topics[i]);
    //     }

    //     emit TopicsAdded(_topics.length, topics.length, totalChoicesCount);
    // }

    /**
    @notice This function allows to add topics : questions and their choices, in batch
    @dev structure of choice : [topic choices][topics] / read/write : a.[topic n][choice n] / lenght : a.length == topics.length
    @param _questions is an array of string representing the questions of the topics
    @param _choices is an array of array of string representing the choices of the topics
     */
    function addTopicsBatch(string[] calldata _questions, string[][] calldata _choices) external onlyOwner {
        require(_questions.length == _choices.length, 'Arrays must have the same length');
        uint choicesCount = totalChoicesCount;
        Topic[] storage currentTopics = topics;
        for (uint i = 0; i < _questions.length; i++) {
            Topic memory topic;
            topic.firstChoiceIndex = choicesCount;
            topic.question = _questions[i];
            topic.choices = _choices[i];
            choicesCount += _choices[i].length;
            currentTopics.push(topic);
        }
        totalChoicesCount = choicesCount;

        emit TopicsAdded(_questions.length, topics.length, totalChoicesCount);
    }


    // :::::::::::::::::::::::::: POLL WORKFLOW :::::::::::::::::::::::::::::: //
    /**
    @notice allows the admin to submit the poll to the DAO for validation (validators will check for illegal content...) 
     */
    function submitPoll() external onlyOwner {
        require(pollStatus == PollStatus.PollInitialized, 'Poll already submitted');
    
        uint amount = amountToValidators + amountToDAO;

        IDAOPollSubmission(DAOaddress).submitPoll{value: amount  }(address(this), amountToValidators, amountToDAO);
//  DPollPluginValidator(DAOaddress).submitPoll{value: amount  }(address(this), amountToValidators, amountToDAO);

        pollStatus = PollStatus.PollSubmitted;  

        emit PollStatusChange(PollStatus.PollInitialized, PollStatus.PollSubmitted);
    }


    /**
    @notice allows the DAO to validate or reject the poll
    @dev if the poll is validated, the DAO will pay the validators and the DAO
    @dev if the poll is rejected, the DAO will refund the owner balance less the validators fees (owner should claim it back later)
    @dev it set the timestampLimit to the end of the poll and start the poll
    @param pollAddress is the address of the poll to validate (this contract)
    @param isValid is a boolean to validate or reject the poll
     */
    function setPollValidation(address pollAddress, bool isValid) external payable onlyDao {
        require(pollStatus == PollStatus.PollSubmitted, 'Poll not submitted');
        // require(topics.length > 0, 'No topic');
        require(pollAddress == address(this), 'Wrong poll address'); 
        require(isValid || msg.value >= amountToDAO, 'No funds to refund');
  
        if (isValid) {
            // timestampLimit = block.timestamp + duration;
            pollStatus = PollStatus.PollingStarted;

        } else {
            isCanceled = true;
            pollStatus = PollStatus.PollingEnded;
        }
     
    }

    /**
    @notice allows the admin to end the poll
    @dev LATER : delay and number of answers will allow to set requirements to end the Poll by everybody (not only the owner), with incentives to automate the process
     */
    function endPoll() external onlyOwner() {
        require(pollStatus == PollStatus.PollingStarted, 'Polling not started');
        // require(block.timestamp > timestampLimit || answers.length >= requiredResponseCount, 'Polling not ended');
       
        pollStatus = PollStatus.PollingEnded;
    }


    // ::::::::::::::::::::::: FUNDS ::::::::::::::::::::::::::::::::::::::::: //
    /**
    @notice allows the admin to withdraw the funds of the poll in case of rejection by the DAO or if the poll end without enough respondents
     */
    function claimRefund() external onlyOwner {
        require(pollStatus == PollStatus.PollingEnded, 'Poll already distributed');
        _refund();
    }

//A EFFACER
    /**
    // @notice allows to send funds to the DAO and the validators
    // @dev the amount is split in two : one part for the DAO and one part for the validators
    // @param _toValidators is the amount to send to the validators
    // @param _toDAO is the amount to send to the DAO
    //  */
    // function _payDAO(uint _toValidators, uint _toDAO) private {
    //     require(balance >= _toValidators + _toDAO, 'Not enough funds');

    //     uint amount = _toValidators + _toDAO;

    //     balance -= amount;

    //     //FOR TEST waiting for DAO
    //     (bool res,) = DAOaddress.call{value: amount}("from poll");
    //     require(res, "DAO transfer failed");

    //     //when DAO is ready
    //     // bool confirmation = DAOaddress.payForPoll{value: amount}(_toValidators, _toDAO);
    //     // require(res, "DAO transfer failed");
    //     emit PollWithdrawal(DAOaddress, amount, "DAO and Validators payment");
    // }

    /**
    @notice allows to refund the owner in case of rejection by the DAO or if the poll end without enough respondents
     */
    function _refund() private onlyOwner() {
        require(balance > 0, 'No funds to refund');
        require(balance <= address(this).balance, 'Not enough funds'); //mismatch between balance and address(this).balance
        // require(pollStatus == PollStatus.PollingEnded, 'Poll already distributed');

        uint amount = balance;
        balance = 0;
        (bool res,) = msg.sender.call{value: amount}("");
        require(res, "Refund failed");

        emit PollWithdrawal(msg.sender, amount, "Refund to owner");
    }
}