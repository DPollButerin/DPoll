// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DPollToken.sol";

contract DPollStorage is Ownable {
    //eth balance of the DAO
     DPollToken public DPTtoken;

    uint public DAObalance;

    uint256 public constant DAO_MEMBERSHIP_FEE = 0.1 ether;

    enum MemberRole {GUEST, DAO, TEAM, OWNER, MEMBER}

    struct Member {
        address memberAddress;
        uint256 memberSince;
        uint256 lastProposalCreation;
        uint256 balance;
        MemberRole role;
    }
    //add blacklist => si revoke 2 fois dc acte malicious ou douteux

    mapping(address => Member) public members;
    Member[] public membersList;


}