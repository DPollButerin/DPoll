// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../node_modules/@openzeppelin/contracts/proxy/Clones.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./IPollInitiator.sol"; 
import "./PollMaster.sol";

/**
@notice This is the factory used to create poll contract clones from poll master contract
-In this structure : 1 poll == 1 clone contract with its storage context
-Master Poll Address needs to be set before creating a poll

@todo : DAO should become the owner of the factory / at the moment the same address should be used for DAO and factory
*/
contract PollFactory is Ownable, IPollInitiator {

  address public DAOaddress;
  address public pollMasterAddress;
  address[] pollCloneAddresses;

  event PollCreated(address newPollContract);

  /**
  @notice allows to set the master voting addres from which votes will be cloned
  @todo onlyDAO to set the master poll address
  */
  function setPollMasterAddress(address _pollMasterAddress) external onlyOwner {
    pollMasterAddress = _pollMasterAddress;
  }

  function setDAOAddress(address _DAOaddress) external onlyOwner {
    DAOaddress = _DAOaddress;
  }


  /**
  @notice function to create a new poll. One poll == one clone contract with its storage context.
  @dev payment is done here to avoid DoS attack by creating a lot of clones
  @return the clone address, it allows with Interfaces to participate to the poll as admin, respondent or DAO
  */
  function createPollContract(
        uint _duration,
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
        _duration,
        _requiredResponseCount,
        _pollName,
        _pollDescription,
        _eligibilityCriteria
    );  

    pollCloneAddresses.push(pollClone);

    emit PollCreated(pollClone);
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