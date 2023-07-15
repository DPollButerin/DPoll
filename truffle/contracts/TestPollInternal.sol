// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title TestPollMaster
@notice This contract is used to test the PollMaster contract
@dev It is a mock of the PollMaster contract to call and test internal functions
@dev It is not deployed on the blockchain
@dev It is used in the test suite
 */
import "./PollMaster.sol";


contract TestPollInternal is PollMaster {


    //calling all internal function of PollLogic contract in public or external functions
    function testInitPoll(string calldata _name, uint _duration, uint _maxRespondents, uint _maxChoices) external {
        initPoll(_name, _duration, _maxRespondents, _maxChoices);
    }

    function testAddTopic(string calldata _question, string[] calldata _choices) external {
        addTopic(_question, _choices);
    }

    function testAddTopics(Topic[] calldata _topics) external {
        addTopics(_topics);
    }

    

// contract PollHelpers {

    // :::::::::::::::::::::::::: bits operations :::::::::::::::::::::::::::::: //


    /**
    @notice set bit of a uint256 from an array of positions to 1 (right to left)
    @dev in poll storage answer of a respondent is a uint256 flagging the choices of the respondent (one bit is one index of total choices[])
    @dev AT THE MOMENT a max of 256 choices is allowed 
    @dev example : positions of bit to set : [3,7,11,15,19,23,27,31] => bin: 10001000100010001000100010001000 => uint:2290649224 
    @param _bitsToSetPositions is an array of positions of bit to set to 1
    @return flags is the uint256 with the bits set to 1
     */
    function testSetBitFromPositions(uint256[] calldata _bitsToSetPositions) internal pure returns (uint256) {
        return setBitFromPositions(_bitsToSetPositions);
    }

    /**
    @notice get the number of set bits in a uint256
    @dev it is used to count the number of choices of a respondent
    @param _flags is the uint256 to count the number of set bits
    @return count is the number of set bits
     */
    function testGetSetBitCount(uint256 _flags) external pure returns (uint256) {
        return getSetBitCount(_flags);
    }

    /**
    @notice get the positions of set bits in a uint256 (right to left)
    @dev it is used to get the choice indexes selected by a respondent
    @dev example : uint:2290649224 => bin: 10001000100010001000100010001000 => set bits: [3,7,11,15,19,23,27,31]
    @param _flags is the uint256 to get the positions of set bits
    @return positionsArray is the array of positions of set bits
     */
    function testGetSetBitPositions(uint256 _flags) external pure returns (uint[] memory) {
        return getSetBitPositions(_flags);
    }
}


    // :::::::::::::::::::::::::: SETTERS :::::::::::::::::::::::::::::: //


// PollLogic is PollStorage {




  
    // :::::::::::::::::::::::::: SETTERS :::::::::::::::::::::::::::::: //

    // function setDuration(uint _duration) external onlyOwner {
    //     duration = _duration;
    // }
    // function getFirstChoiceIndex

    // // :::::::::::::::::::::::::: GETTERS :::::::::::::::::::::::::::::: //

  

    // // :::::::::::::::::::::::::: GETTERS :::::::::::::::::::::::::::::: //

 


//if started

    // :::::::::::::::::::::::::: Poll workflow :::::::::::::::::::::::::::::: //

//pour le moment submit / valid ou rejet pas de ressoumission
//ou VALID vote => 0.5 non 1 oui 
//ou moitité là moitié fin
// plus circuit de check validation par dao => slash proposition validator son % stake de membre si passer contre les régles
// puis arbitrage kleros si soucis

//RENDRE PAYABLE
  
//dev incentive to answer intime (reward decrease with time with rootsquare
//no modifier (let access to bot / later incentive to check time and count)
 
    ///////TRANSFER
//create deja check > 1 ether et > min 0.001 * voters






    // function testInitBalances(uint requiredAnswerCount) external payable onlyOwner {
    //     initBalances(uint requiredAnswerCount)
    
    // }

    function sendToDao() external {
        sendToDao();
    }


    function testSendToValidators() external {
        sendToValidators();
    }

    function testRefund() external {
        refund();
    }

function testUpdateRespondentBalance(address _respondent) intexternalernal {
    updateRespondentBalance(_respondent);
    }



}
