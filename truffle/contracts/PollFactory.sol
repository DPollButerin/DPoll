// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../node_modules/@openzeppelin/contracts/proxy/Clones.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./IPollInitiator.sol"; 
import "./PollMaster.sol";

/*
 * In the purpose of this exam factory is minimalist : pollMasterAddress is set by the owner of the factory once only (no upgrade of the master poll contract)
 *
 * @todo : 
 * -set the DAO address as owner of the factory. At the moment, the owner is the deployer of the factory, it should be the same as the deployer of the DAO
 * -manage poll versions by adding new master poll contracts and keeping track of the clones addresses versions
 */

/**
@title PollFactory
@author ibourn
@notice This is the factory used to create poll contract clones from poll master contract
-In this structure : 1 poll == 1 clone contract with its storage context
-Master Poll Address needs to be set before creating a poll
*/
contract PollFactory is Ownable, IPollInitiator {

  address public DAOaddress;
  address public pollMasterAddress;
  address[] pollCloneAddresses;

  event PollCreated(address newPollContract, address pollMasterAddress, address creator);

  /**
  @notice allows to set the master voting addres from which votes will be cloned
  */
  function setPollMasterAddress(address _pollMasterAddress) external onlyOwner {
    require(pollMasterAddress == address(0), 'Poll master address already set');
    pollMasterAddress = _pollMasterAddress;
  }

  function setDAOAddress(address _DAOaddress) external onlyOwner {
    require(DAOaddress == address(0), 'DAO address already set');
    DAOaddress = _DAOaddress;
  }


  /**
  @notice function to create a new poll. One poll == one clone contract with its storage context.
  @dev payment is done here to avoid DoS attack by creating a lot of clones
  @return the clone address, it allows with Interfaces to participate to the poll as admin, respondent or DAO
  */
  function createPollContract(
        // uint _duration,
        uint _requiredResponseCount,
        string calldata _pollName,
        string calldata _pollDescription,
        string calldata _eligibilityCriteria
  ) 
        external 
        payable  
        returns(address) 
  {
    address pollClone = Clones.clone(pollMasterAddress);

    PollMaster(pollClone).initialize{value: msg.value}(
        msg.sender, 
        DAOaddress,
        // _duration,
        _requiredResponseCount,
        _pollName,
        _pollDescription,
        _eligibilityCriteria
    );  

    pollCloneAddresses.push(pollClone);

    emit PollCreated(pollClone, pollMasterAddress, msg.sender);
    return pollClone;
  }

  /**
  @notice getter to get the address of master poll contract
  @return address of current master poll contract
  */
  function getMasterPollAddress() external view returns(address) {
      return pollMasterAddress;
  }

  /**
  @notice getter to get addresses of each poll created
  @return an array of clone addresses
  */
  function getPollClonesAddresses() external view returns(address[] memory) {
      return pollCloneAddresses;
  }
}