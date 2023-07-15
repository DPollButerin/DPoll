// SPDX-License-Identifier: GPL-3.0

import "./VotingLogic2.sol";

pragma solidity 0.8.20;

/**
@title 'Voting2' is the master voting contract
@notice it allows to manage ownership of clones. It get logic and storage by heritage
@dev address of the factory should be passed to the constructor to allow clone's ownership transfer
*/
contract Voting2 is VotingLogic2 {

    ///@dev states used to manage master and clones ownership. FirstOwner must be the factory as it creates clones
    address private immutable firstOwner;
    ///@dev it's important that value is false (even if false is the default value, i set it for clear code reading)
    bool private initizalized = false;

    /**
    @notice transfer ownership of Voting2 and set the factory as 'firstOwner' 
    */
    constructor(address _factory) {
        _transferOwnership(_msgSender());
        firstOwner = _factory;
    }

    /**
    @notice manages the ownership of clones 
    - This action is needed to avoid : clone owner == address(0) and ownhership theft vulnerability 
    - as there's no constructor in clone we must call an init function at creation.
    - it will check that clone is not initialized and that caller (msg.sender) is the factory (firstOwner) to allow
    transferOfOwnership to the admin (_newOwner)
    */
    function initialize(address _newOwner, string calldata _voteName) external {
        require(!initizalized, "Ownable: ownership is already initialized");
        initizalized = true;
        require(_msgSender() == firstOwner, "Ownable: caller is not the first owner");

        voteName = _voteName;
        _initializeOwnership(_newOwner);
    }

    /**
    @dev clone is initialized and ownership set, we can transfer it to newOwner (should be admin address)
    */
    function _initializeOwnership(address newOwner) private {
        require(newOwner != address(0), "Ownable: new owner is the zero address");

        _transferOwnership(newOwner);
    }
}