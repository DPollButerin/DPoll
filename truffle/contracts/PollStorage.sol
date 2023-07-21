// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title PollStorage
@author ibourn
@dev This contract contains the storage of the poll, internal visibility is precised to make it more readable
@dev (see PollMaster.sol for comments & explanations)
@inheritdoc Ownable
 */
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol"; 
import "./Certifier.sol";

contract PollStorage is Ownable {

    // :::::::::::::::::::::::::: ENUMS & STRUCTS ::::::::::::::::::::::::: //
    /**
    @dev Workflow status of the poll 
    @dev RegisteringWhitelist is optional, not implemented yet (for 'private' polls)
    @dev PollSubmitted partially implemented (it will allow later to reformulate in case of invalidation)
    @dev ATTENTION : RegisteringWhiteListe and PollValidated are skipped in this early version
     */
    enum PollStatus {
        PollInitialized,
        PollSubmitted,
        PollValidated,
        RegisteringWhitelist,
        PollingStarted,
        PollingEnded
    }

    /**
    @dev Topic struct
    @dev multi selection of choices per topic is allowed
    @dev firstChoiceIndex facilitates the construction of the poll and the answers
    @param firstChoiceIndex is the index of the first choice in the list of all cumulated and ordored choices
    @param question is the subject of one topic of the poll
    @param choices is the list of choices for one topic of the poll
     */
    struct Topic {
        uint firstChoiceIndex;
        string question;
        string[] choices;
    
    }

    // :::::::::::::::::::::::::: CONSTANTS :::::::::::::::::::::::::::::: //
    /**
    @dev minimum amount to create a poll : 0.05 ether
     */
    uint public constant MIN_POLL_AMOUNT = 50000000000000000; // = 0.05 ether
    /**
    // @dev minimum amount per respondent to be paid to create a poll : 0.0001 ether
    //  */
    uint public constant MIN_RESPONDENT_AMOUNT = 100000000000000; // = 0.0001 ether
    /**
    @dev LIMITATION : AT THE MOMENT : limited poll < 50 questions and < 10 choices for 100 respondents
     */
    uint public constant MAX_CHOICES_LENGTH = 10;
    uint public constant MAX_TOPICS_LENGTH = 50;
    /**
    @dev LIMITATION : AT THE MOMENT : there's a limit of 256 choices per poll (add more buffers to manage more choices)
     */
    uint public constant MAX_CHOICES_COUNT = 256;
    /**
    @dev LIMITATION : AT THE MOMENT : we limit the number of respondents. Need to optimize process of getting answers for bigger polls
     */    
    uint public constant MAX_RESPONDENTS_LENGTH = 1000;
    /**
    @dev pseudo proof of certification (see Certifier contract in Certifier.sol)
     */
    bytes32 internal constant PSEUDO_PROOF = keccak256(abi.encodePacked("I claim this address is certified" ));
    /** 
    @dev percentage of amount paid for the poll going to validators
     */
    uint internal constant PERCENTAGE_TO_VALIDATORS = 10;
    /**
    @dev percentage of amount paid for the poll going to DAO
     */
    uint internal constant PERCENTAGE_TO_DAO = 10;


    // :::::::::::::::::::::::::: VARIABLES :::::::::::::::::::::::::::::: //
    /*
    @todo NEED TEMP DAO TO REPSOND TO THE CONTRACT
    */
    address public DAOaddress;
    address public certifierAddress;

    // :::::::::::::::::::::::::: params defined by the owner :::::::::::: //
    /*time limitation and delay are remove for the exam to facilitate tests and live demo*/
    // /**
    // @dev duration of the poll in seconds
    //  */
    // uint internal duration;
    // /**
    // @dev timestamp of the end of the poll (time of the validation + duration)
    //  */
    // uint internal timestampLimit;
    /**
    @dev number of answers the owner of the poll wants to get to close the poll
     */
    uint internal requiredResponseCount;
    /**
    @dev total number of choices of the poll / used also during topics addition to set the firstChoiceIndex of the next topic
     */
    uint internal totalChoicesCount;
    // /**
    // @dev UTILITY state used to construct the poll structure (it's the index of the last choice of the previous topic in the list of all choices)
    //  */
    // uint internal prevChoiceIndex;
    // /**
    // @dev UTILITY state used to construct the poll structure (it's the index of the last choice of the previous topic in the list of all choices)
    //  */
    // uint internal respondent;
    /**
    @dev name of the poll
     */
    string internal pollName; 
    /**
    @dev description of the poll
     */
    string internal pollDescription; 
    /**
    @dev to be replaced by struct : object/options (see Certifier contract in Certifier.sol)
     */
    string internal eligibilityCriteria;




    // :::::::::::::::::::::::::: params of the contract ::::::::::::::::: //
    /*@todo: pack in a struct to optimize storage*/
    /**
    @dev balance of the contract
     */
    uint internal balance; //balance of the contract
    /**
    @dev amount to be paid to the DAO if the poll is validated (10% of the amount sent to create the poll)
     */
    uint internal amountToDAO; 
    /**
    @dev amount to be paid to the validators if the poll is validated (10% of the amount sent to create the poll)
     */
    uint internal amountToValidators; 
    /**
    @dev amount to be paid to the respondents if the poll is validated (80% of the amount sent to create the poll / number of respondents)
     */
    uint internal amountToRespondent; 
    // /**
    // @dev state used to manage master and clones ownership. FirstOwner must be the factory as it creates clones
    // */
    // address internal immutable firstOwner;
    /**
    @dev current status of the poll
     */
    PollStatus internal pollStatus;
    /**
    @dev true if the DAO invalidates the poll, the poll can't continue
     */
    bool internal isCanceled;
    // /**
    // @dev it's important that value is false (even if false is the default value, i set it for clear code reading)
    // */
    // bool internal initizalized = false;

    // :::::::::::::::::::::::::: MAPPING,ARRAY... :::::::::::::::::::::::::::::: //
    /**
    @dev this contains amount to be claimed by the respondents
     */
    mapping (address => uint) internal balances;
    /**
    @dev this contains the list of questions and choices
    */
    Topic[] internal topics;
    /**
    @dev this contains the chronological list of answers (not linked to the respondent address directly)
    @dev one respondent's answer is a uint256 flagging the choices of the respondent (one bit is one index of total choices in order of topic choices / 1 = choosen answer)
     */
    uint256[] internal answers;

    // mapping (address => bool) internal responded; //hasAnswered
    // address[] internal respondents; // to add if linked to the DAO for extra rewards





////EFFACER LA SUITE


    // function getRespondents() external view returns (address[] memory) {
    //     return respondents;
    // }

    // function getRespondentsLength() external view returns (uint) {
    //     return respondents.length;
    // }

    // function getAnswers() external view returns (uint[][] memory) {
    //     return answers;
    // // }

    // function getAnswersLength() external view returns (uint) {
    //     return answers.length;
    // }

    // function getWorkflowStatus() external view returns (PollStatus) {
    //     return pollStatus;
    // }   

    // function getDuration() external view returns (uint) {
    //     return duration;
    // }

    // function getRespondentsThreshold() external view returns (uint) {
    //     return requiredResponseCount;
    // }







}
