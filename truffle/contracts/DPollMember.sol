// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
for now, in this POC :
-anyone can become a member by sending 0.1 ether to the DAO
-this amount is locked for 28 days (can be changed) to vaoid sybil attack
-when leaving the DAO this amount is sent back to the member BUT not if the member is revoked by the DAO

-the DPTtoken is the gouvrnance token of the DAO
-The DAO mint all the DPTtoken at the creation and distribute them to the members
-to gain DPTtoken you need to be a member and perform action for the DAO :
+ create, vote, close, execute a proposal
+ validate or invalidate a poll, close a submission ...

-closing proposal, submission and such action are 'opened' to allow later bots to perform them
in order to allow an automatization of tasks with an incentive to do it well
*/

/**
@title DPollMember
@author ibourn
@notice This contract is used to manage the members of the DAO and the DPToken holders (gouvernance token)
 */
import "./DPollStorage.sol";


contract DPollMember is DPollStorage {

    function grantRole(address _memberAddress, MemberRole _role) public onlyOwner {
        members[_memberAddress].role = _role;
    }

    function revokeRole(address _memberAddress) public onlyOwner {
        members[_memberAddress].role = MemberRole.GUEST;
    }

    function addMember( address _memberAddress) public payable {
        require(msg.value >= DAO_MEMBERSHIP_FEE, "You need to send at least 0.1 ether");
        require(members[_memberAddress].role == MemberRole.GUEST, "You are already a member");
        Member memory newMember;
        newMember.memberAddress = _memberAddress;
        newMember.memberSince = block.timestamp;
        newMember.role = MemberRole.MEMBER;
        DAObalance += msg.value;
    }

    function removeMember(address _memberAddress) public onlyOwner {
        Member memory member = members[_memberAddress];
        require(member.role == MemberRole.MEMBER, "You are not a member");
        require(member.memberSince + 28 days < block.timestamp, "You need to wait 28 days before leaving the DAO");
        uint amount = member.balance;
        members[_memberAddress].balance = 0;
        (bool success, ) = payable(_memberAddress).call{value: amount}("");
        require(success, "Transfer failed.");
        delete members[_memberAddress];
        //update balance => DPT to DAO // eth send back to member
    }

    function revokeMembership(address _memberAddress) public onlyOwner {
        Member storage member = members[_memberAddress];
        require(member.role == MemberRole.MEMBER, "You are not a member");
        DAObalance += member.balance;
        member.balance = 0;

        delete members[_memberAddress];
        //update balance => DPT to DAO // eth send back to member
    }
}