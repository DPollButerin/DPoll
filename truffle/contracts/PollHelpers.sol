// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/**
@title PollHelpers
@author ibourn
@notice This contract contains the helpers functions of the poll
@dev uint256 is precised to not change this type in the future
@dev (see PollMaster.sol for comments & explanations)
 */
contract PollHelpers {

    // :::::::::::::::::::::::::: BITS OPERATIONS :::::::::::::::::::::::::::::: //
    /**
    @notice set bit of a uint256 from an array of positions to 1 (right to left)
    @dev in poll storage answer of a respondent is a uint256 flagging the choices of the respondent (one bit is one index of total choices[])
    @dev AT THE MOMENT a max of 256 choices is allowed 
    @dev example : positions of bit to set : [3,7,11,15,19,23,27,31] => bin: 10001000100010001000100010001000 => uint:2290649224 
    @param _bitsToSetPositions is an array of positions of bit to set to 1
    @return flags is the uint256 with the bits set to 1
     */
    function setBitsFromPositions(uint256[] calldata _bitsToSetPositions) internal pure returns (uint256) {
        uint length = _bitsToSetPositions.length;
        if (length > 256) {
            revert("Too many bits to set.");
        }
        uint256 bitToSet;
        uint256 flags;
        for(uint i; i < length;) {
            bitToSet = _bitsToSetPositions[i];
            if (bitToSet > 255) {
                revert("Bit to set out of range.");
            }
            flags = flags | (1 << bitToSet);
            unchecked { ++i; }
        }
        return flags;
    }

    /**
    @notice get the number of set bits in a uint256
    @dev it is used to count the number of choices of a respondent
    @param _flags is the uint256 to count the number of set bits
    @return count is the number of set bits
     */
    function getSetBitsCount(uint256 _flags) internal pure returns (uint256) {
        uint256 count;
        uint256 copy = _flags;
        while (copy > 0) {
            count += copy & 1;
            copy = copy >> 1;
        }
        return count;
    }

    /**
    @notice get the positions of set bits in a uint256 (right to left)
    @dev it is used to get the choice indexes selected by a respondent
    @dev example : uint:2290649224 => bin: 10001000100010001000100010001000 => set bits: [3,7,11,15,19,23,27,31]
    @param _flags is the uint256 to get the positions of set bits
    @return positionsArray is the array of positions of set bits
     */
    function getSetBitsPositions(uint256 _flags) internal pure returns (uint[] memory) {
        uint setBitCount = getSetBitsCount(_flags);
        uint[] memory positionsArray = new uint[](setBitCount);
        uint counter = 0;
        
        for(uint256 i; i < 256;) {
            if ((_flags & (1 << i)) != 0) {
                positionsArray[counter] = i;
                ++counter;
            }
            unchecked { ++i; }
        }
        return positionsArray;
    }
}