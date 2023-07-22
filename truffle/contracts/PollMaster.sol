// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
 * In the purpose of this exam, the functionalities are limited to the minimum (to respect delay)
 *
 * this contract :
 * -init a poll (someone wishing to create a poll must become a DAO member before... it avoid spamming)
 *
 * -it should be sumbitted to the DAO for validation (sending the funds to pay validators and DAO)
 *
 * -after validation, the poll can be started (if poll is not validated the DAO resend the funds to the owner less the validators fees, owner should claim it back later)
 *
 * -the poll can be answered by any eligible respondents
 *
 * -in the context of this MVP eligbility is simulated by a fake certifier contract (see Certifier.sol) so all respondent are eligible
 *
 * -the number of respondents is limited to a maximum for the first version
 *
 * -TO FACILITATE TEST AND LIVE DEMO during the exam : all time limits are removed (duration, delay, timestampLimit) and so not implemented
 *
 * -Amount here are in wei and set to facilitate tests and live demo and the testnet if needed (0.05 ether + 0.001 ether * number of respondents)
 *
 *--------------------------------------------------------------------------------------------------------
 * Deviation from the scope of application :
 *
 * - in case of a poll end without the required number of respondents, the respondents can claim their rewards (otherwise a malicious poll creator could
 * set a very big required number of respondents to avoid paying them as it will not be reached, but he could read the memory of the contract to get the answers before the end
 * to have a competitive advantage as only the validators will be paid)
 *
 * - a minimum amount is set to avoid a poll with a very low amount with : 0.2 ether + 0.001 ether * number of respondents
 *
 *--------------------------------------------------------------------------------------------------------
 * @todo :
 * -case of a more targeted survey : 
 * + add a 'withWhitelist' option and a merkle tree management to set a batch of respondents
 * + this option will skip the eligibility check
 *
 * -manage big poll with pagination (or splitting the poll in multiple clones) to avoid gas limit DoS attack
 * + it implies calculating and testing functions to find the more flexible and secure solution to manage different scenario (more topics, more respondents, more choices, more answers...)
 *
 * -add a reset process to allow a new poll with the same contract in case of unvalid poll (manage the new payment to validators for this case)
 *
 * -make the amount states, percentage to pay ... customizable (to let the DAO update these params with proposals)
 *
 * -add an incentive to respond in time (use root square to decrease the reward with time ?)
 *
 * -function to end the poll... without modifier to let access later to bots to perform actions (incentives could be added to run poll automatically)
 * need reenabling reuire with delay and number of answers 
 *
 * -automisation of the workflow will be enabled with pollValidated process, the above modification and associated events
 */


/**
@title PollMaster
@author ibourn
@notice This contract allows to initialize a poll, and after validation, to respond to it. It also allows to manage ownership of clones 
@notice results are not not cumulative but separate, as the owner could want to do a cross-data analysis
@notice addresses are not linked directly to answers
@dev The contract inherits from PollUser (and so from PollAdmin, PollView, PollStorage, Ownable)
@inheritdoc Ownable
 */

import "./PollUser.sol";


contract PollMaster is PollUser {
    /**
    @dev states used to manage master and clones ownership. FirstOwner must be the factory as it creates clones
    */
    address private immutable firstOwner;
    /**
    @dev it's important that value is false (even if false is the default value, i set it for clear code reading)
    */
    bool private initizalized = false;


   /**
    @notice transfer ownership of PollMaster and set the factory as 'firstOwner' 
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
    function initialize(
        address _newOwner, 
        address _DAOaddress,
        address _certifierAddress,
        // uint _duration,
        uint _requiredResponseCount,
        string calldata _pollName,
        string calldata _pollDescription,
        string calldata _eligibilityCriteria
        ) 
        external
        payable
        {
        require(!initizalized, "Ownable: ownership is already initialized");
        initizalized = true;
        require(_msgSender() == firstOwner, "Ownable: caller is not the first owner");
        require(_requiredResponseCount <= MAX_RESPONDENTS_LENGTH, 'Too many respondents');

        _initializeOwnership(_newOwner);
        _initializeSettings(_DAOaddress, _certifierAddress, _requiredResponseCount, _pollName, _pollDescription, _eligibilityCriteria);
        _initializeAmounts(msg.value);
    }

    /**
    @dev clone is initialized and ownership set, we can transfer it to newOwner (should be admin address)
    */
    function _initializeOwnership(address newOwner) private {
        require(newOwner != address(0), "Ownable: new owner is the zero address");

        _transferOwnership(newOwner);
    }

   /*
    function _initialize private onlyOwner {
        not necessary as it's done at initialization and funciton is private
        */
    /**
    @dev set general settings with the params passed by the factory to the initialize function
     */
    function _initializeSettings(
        address _DAOaddress,
        address _certifierAddress,
        // uint _duration,
        uint _requiredResponseCount,
        string calldata _pollName,
        string calldata _pollDescription,
        string calldata _eligibilityCriteria
        ) private {
        // require(pollStatus == PollStatus.PollInitialized, 'Poll already initialized');
        // require(_duration > 0, 'Duration must be greater than 0');
        require(_requiredResponseCount > 0, 'Respondents threshold must be greater than 0');
        require(bytes(_pollName).length > 0, 'Poll name must not be empty');
        require(bytes(_pollDescription).length > 0, 'Poll description must not be empty');
        require(bytes(_eligibilityCriteria).length > 0, 'Eligibility criteria must not be empty');
        // duration = _duration;
        requiredResponseCount = _requiredResponseCount;
        // pollStatus = PollStatus.PollInitialized;
        pollName = _pollName;
        pollDescription = _pollDescription;
        eligibilityCriteria = _eligibilityCriteria;

        DAOaddress = _DAOaddress;
        certifierAddress = _certifierAddress;
    }  

    /*
    function _initializeAmounts(uint _amountSent) private onlyOwner {
        not necessary as it's done at initialization and funciton is private
        */
    /**
    @dev set amounts settings with the params passed by the factory to initialize function
     */
    function _initializeAmounts(uint _amountSent) private  {
        // require(pollStatus == PollStatus.PollInitialized, 'Poll already distributed');
        require(_amountSent >= (MIN_POLL_AMOUNT + (MIN_RESPONDENT_AMOUNT * requiredResponseCount)), 'Funds inferior to poll minimum cost');

        balance = _amountSent;    
        amountToDAO = _amountSent * PERCENTAGE_TO_DAO / 100;
        amountToValidators = _amountSent * PERCENTAGE_TO_VALIDATORS / 100;
    
        uint balanceToUsers = _amountSent - amountToDAO - amountToValidators;
        amountToDAO += balanceToUsers % requiredResponseCount;
        amountToRespondent = balanceToUsers / requiredResponseCount; //cast to uint 
    }
}   