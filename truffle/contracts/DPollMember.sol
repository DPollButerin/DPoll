// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

/*
for now, in this POC :
-anyone can become a member by sending 0.1 ether to the DAO
-this amount is locked for 28 days (can be changed) to vaoid sybil attack (you will be member for 28 days minimum)
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
import "./IDAOmembership.sol";

//@todo add events to membership actions
contract DPollMember is DPollStorage, IDAOmembership {
    modifier onlyMember() {
        require(members[msg.sender].role == MemberRole.MEMBER, "You are not a member");
        _;
    }

    function isMember(address _memberAddress) public view returns (bool) {
        return members[_memberAddress].role == MemberRole.MEMBER;
    }
    //!!DONT FORGET TEST NEW FUNCTION
    function isMemberExtCall(address _memberAddress) external view returns (bool) {
        return isMember(_memberAddress);
    }

    function getMember(address _memberAddress) public view returns (Member memory) {
        return members[_memberAddress];
    }

    function getMembersCount() public view returns (uint) {
        return membersList.length;
    }

    //later only DAO will be able to grant or revoke role with Execution proposals
    function grantRole(address _memberAddress, MemberRole _role) internal onlyOwner {
        members[_memberAddress].role = _role;
    }

    // function revokeRole(address _memberAddress) public onlyDAO {
    //     members[_memberAddress].role = MemberRole.GUEST;
    // }

    function addMember(address _memberAddress) public payable {
        require(msg.value >= DAO_MEMBERSHIP_FEE, "You need to send at least 0.02 ether");
        require(members[_memberAddress].role == MemberRole.GUEST, "You are already a member");
        require(members[_memberAddress].memberSince == 0, "Already in the DAO");
        Member memory newMember;
        newMember.memberAddress = _memberAddress;
        newMember.memberSince = block.timestamp;
        newMember.role = MemberRole.MEMBER;
        newMember.balance = msg.value;
        membersList.push(newMember);
        members[_memberAddress] = newMember;

        // DAObalance += msg.value;
    }

    function removeMember(address _memberAddress) public onlyMember() {
        require(_memberAddress == msg.sender, "Only member can decide to leave the DAO");
        Member memory member = members[_memberAddress];
        require(member.memberSince + 28 days < block.timestamp, "You need to wait 28 days before leaving the DAO");
        uint amount = member.balance;
        members[_memberAddress].balance = 0;
        (bool success, ) = payable(_memberAddress).call{value: amount}("");
        require(success, "Transfer failed.");
        delete members[_memberAddress];
        //update balance => DPT to DAO // eth send back to member
    }

    // function revokeMembership(address _memberAddress) public onlyDAO {
    //     Member storage member = members[_memberAddress];
    //     require(member.role == MemberRole.MEMBER, "Address is not a member");
    //     DAObalance += member.balance;
    //     member.balance = 0;

    //     delete members[_memberAddress];
    //     //update balance => DPT to DAO // eth send back to member
    // }


}